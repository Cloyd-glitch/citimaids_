<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Client;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    private function range(Request $request): array
    {
        $from = $request->filled('from')
            ? Carbon::parse($request->from)->startOfDay()
            : now()->startOfMonth()->startOfDay();
        $to = $request->filled('to')
            ? Carbon::parse($request->to)->endOfDay()
            : now()->endOfDay();
        return [$from, $to];
    }

    /** GET /api/reports/overview */
    public function overview(Request $request)
    {
        [$from, $to] = $this->range($request);
        $avgBase = (float) (Service::avg('base_price') ?: 350);

        $total     = Booking::whereBetween('created_at', [$from, $to])->count();
        $completed = Booking::where('status','completed')->whereBetween('created_at', [$from, $to])->count();
        $pending   = Booking::where('status','pending')->whereBetween('created_at', [$from, $to])->count();
        $confirmed = Booking::where('status','confirmed')->whereBetween('created_at', [$from, $to])->count();
        $cancelled = Booking::where('status','cancelled')->whereBetween('created_at', [$from, $to])->count();

        $revenue = (float) Booking::where('status','completed')
            ->whereBetween('created_at', [$from, $to])
            ->sum('total_amount');
        if ($revenue == 0) $revenue = $completed * $avgBase;

        $totalClients     = Client::count();
        $newClientsInPeriod = Client::whereBetween('created_at', [$from, $to])->count();
        $completionRate   = $total > 0 ? round(($completed/$total)*100,1) : 0;
        $cancellationRate = $total > 0 ? round(($cancelled/$total)*100,1) : 0;

        // Prior period comparison
        $days = max((int) $from->diffInDays($to), 1);
        $prevFrom = $from->copy()->subDays($days);
        $prevTo   = $from->copy()->subSecond();
        $prevTotal   = Booking::whereBetween('created_at', [$prevFrom, $prevTo])->count();
        $prevDone    = Booking::where('status','completed')->whereBetween('created_at', [$prevFrom, $prevTo])->count();
        $prevRevenue = (float) Booking::where('status','completed')->whereBetween('created_at', [$prevFrom, $prevTo])->sum('total_amount');
        if ($prevRevenue == 0) $prevRevenue = $prevDone * $avgBase;
        $prevClients = Client::whereBetween('created_at', [$prevFrom, $prevTo])->count();

        $bookingChange = $prevTotal   > 0 ? round((($total-$prevTotal)/$prevTotal)*100,1)       : null;
        $revenueChange = $prevRevenue > 0 ? round((($revenue-$prevRevenue)/$prevRevenue)*100,1) : null;
        $clientChange  = $prevClients > 0 ? round((($newClientsInPeriod-$prevClients)/$prevClients)*100,1) : null;

        // Weekly trend buckets (up to 5)
        $weeklyTrend = $this->weeklyBuckets($from, $to);

        return response()->json([
            'period'  => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'bookings' => [
                'total' => $total, 'completed' => $completed, 'pending' => $pending,
                'confirmed' => $confirmed, 'cancelled' => $cancelled,
                'completion_rate' => $completionRate, 'cancellation_rate' => $cancellationRate,
                'change' => $bookingChange,
            ],
            'clients'  => ['total' => $totalClients, 'new_in_period' => $newClientsInPeriod, 'change' => $clientChange],
            'revenue'  => ['total' => round($revenue,2), 'change' => $revenueChange],
            'weekly_trend' => $weeklyTrend,
        ]);
    }

    /** GET /api/reports/bookings */
    public function bookings(Request $request)
    {
        [$from, $to] = $this->range($request);

        $bookings = Booking::with(['client:id,name','service:id,name,base_price'])
            ->whereBetween('created_at', [$from, $to])
            ->orderByDesc('created_at')
            ->get();

        $byStatus = $bookings->groupBy('status')->map->count();

        // Smart volume buckets based on preferred_date
        $volumeBuckets = $this->volumeBuckets($from, $to);

        $avgLead = $bookings->filter(fn($b)=>$b->preferred_date)
            ->map(fn($b)=>Carbon::parse($b->created_at)->diffInDays($b->preferred_date))
            ->avg() ?? 0;

        $byDow = Booking::selectRaw("DAYNAME(preferred_date) as dow, COUNT(*) as count")
            ->whereBetween('created_at', [$from, $to])
            ->whereNotNull('preferred_date')
            ->groupBy('dow')->orderByDesc('count')->get();

        return response()->json([
            'summary' => [
                'total'         => $bookings->count(),
                'completed'     => $byStatus['completed']  ?? 0,
                'pending'       => $byStatus['pending']    ?? 0,
                'confirmed'     => $byStatus['confirmed']  ?? 0,
                'cancelled'     => $byStatus['cancelled']  ?? 0,
                'avg_lead_days' => round($avgLead,1),
            ],
            'volume_buckets' => $volumeBuckets,
            'by_day_of_week' => $byDow,
            'recent'         => $bookings->take(10)->values(),
        ]);
    }

    /** GET /api/reports/clients */
    public function clients(Request $request)
    {
        [$from, $to] = $this->range($request);

        $totalClients  = Client::count();
        $newInPeriod   = Client::whereBetween('created_at', [$from, $to])->count();
        $repeatClients = Client::has('bookings', '>', 1)->count();
        $repeatRate    = $totalClients > 0 ? round(($repeatClients/$totalClients)*100,1) : 0;
        $active        = Client::whereHas('bookings', fn($q)=>$q->whereIn('status',['pending','confirmed']))->count();

        $topClients = Client::select('clients.*')
            ->selectRaw('COUNT(bookings.id) as bookings_count')
            ->selectRaw('SUM(bookings.total_amount) as lifetime_value')
            ->leftJoin('bookings','bookings.client_id','=','clients.id')
            ->groupBy('clients.id')
            ->orderByDesc('bookings_count')
            ->take(10)->get();

        $monthlyGrowth = Client::selectRaw("DATE_FORMAT(created_at,'%Y-%m') as month, COUNT(*) as new_clients")
            ->where('created_at','>=',now()->subMonths(6)->startOfMonth())
            ->groupBy('month')->orderBy('month')->get();

        return response()->json([
            'summary' => [
                'total'         => $totalClients,
                'new_in_period' => $newInPeriod,
                'repeat'        => $repeatClients,
                'repeat_rate'   => $repeatRate,
                'active'        => $active,
            ],
            'top_clients'    => $topClients,
            'monthly_growth' => $monthlyGrowth,
        ]);
    }

    /** GET /api/reports/services */
    public function services(Request $request)
    {
        [$from, $to] = $this->range($request);

        $services = Service::select('services.*')
            ->selectRaw('COUNT(b.id) as total_bookings')
            ->selectRaw('SUM(CASE WHEN b.status="completed" THEN 1 ELSE 0 END) as completed_bookings')
            ->selectRaw('SUM(CASE WHEN (b.created_at BETWEEN ? AND ?) THEN 1 ELSE 0 END) as period_bookings', [$from, $to])
            ->selectRaw('SUM(CASE WHEN b.status="completed" THEN COALESCE(b.total_amount,0) ELSE 0 END) as revenue')
            ->leftJoin('bookings as b','b.service_id','=','services.id')
            ->groupBy('services.id')
            ->get()
            ->sortByDesc('total_bookings')->values();

        $totalBk = $services->sum('total_bookings');
        $totalRev = $services->sum('revenue');

        $metrics = $services->map(function($s) use ($totalBk,$totalRev) {
            $compRate    = $s->total_bookings > 0 ? round(($s->completed_bookings/$s->total_bookings)*100,1) : 0;
            $revShare    = $totalRev > 0 ? round(($s->revenue/$totalRev)*100,1) : 0;
            $bkShare     = $totalBk > 0 ? round(($s->total_bookings/$totalBk)*100,1) : 0;
            return [
                'id' => $s->id, 'name' => $s->name, 'status' => $s->status,
                'base_price' => $s->base_price,
                'total_bookings' => (int) $s->total_bookings,
                'period_bookings' => (int) $s->period_bookings,
                'completed_bookings' => (int) $s->completed_bookings,
                'completion_rate' => $compRate,
                'revenue' => round((float)$s->revenue,2),
                'revenue_share' => $revShare,
                'booking_share' => $bkShare,
            ];
        });

        return response()->json([
            'summary' => [
                'total'         => $services->count(),
                'active'        => $services->where('status','active')->count(),
                'total_bookings'=> (int)$totalBk,
                'total_revenue' => round((float)$totalRev,2),
                'top_service'   => $services->first()?->name,
            ],
            'services' => $metrics,
        ]);
    }

    /** GET /api/reports/revenue */
    public function revenue(Request $request)
    {
        [$from, $to] = $this->range($request);
        $avgBase = (float) (Service::avg('base_price') ?: 350);

        $gross = (float) Booking::where('status','completed')
            ->whereBetween('created_at',[$from,$to])->sum('total_amount');
        $completedCnt = Booking::where('status','completed')->whereBetween('created_at',[$from,$to])->count();
        if ($gross == 0) $gross = $completedCnt * $avgBase;

        $confirmedCnt = Booking::where('status','confirmed')->whereBetween('created_at',[$from,$to])->count();
        $cancelledCnt = Booking::where('status','cancelled')->whereBetween('created_at',[$from,$to])->count();
        $outstanding  = $confirmedCnt * $avgBase;
        $lost         = $cancelledCnt * $avgBase;
        $avgBooking   = $completedCnt > 0 ? round($gross/$completedCnt,2) : $avgBase;

        $monthly = Booking::selectRaw("
            DATE_FORMAT(created_at,'%Y-%m') as month,
            SUM(CASE WHEN status='completed' THEN COALESCE(total_amount,{$avgBase}) ELSE 0 END) as revenue,
            COUNT(*) as bookings,
            SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed
        ")->where('created_at','>=',now()->subMonths(6)->startOfMonth())
          ->groupBy('month')->orderBy('month')->get();

        $byService = Service::select('services.id','services.name','services.base_price')
            ->selectRaw('COUNT(CASE WHEN b.status="completed" THEN 1 END) as completed_count')
            ->selectRaw('SUM(CASE WHEN b.status="completed" THEN COALESCE(b.total_amount,services.base_price) ELSE 0 END) as revenue')
            ->leftJoin('bookings as b','b.service_id','=','services.id')
            ->groupBy('services.id')
            ->get()
            ->map(fn($s)=>['name'=>$s->name,'revenue'=>round((float)$s->revenue,2),'count'=>(int)$s->completed_count])
            ->sortByDesc('revenue')->values();

        return response()->json([
            'summary' => [
                'gross_revenue'      => round($gross,2),
                'outstanding'        => round($outstanding,2),
                'lost_revenue'       => round($lost,2),
                'avg_booking_value'  => $avgBooking,
                'completed_bookings' => $completedCnt,
            ],
            'monthly_trend' => $monthly,
            'by_service'    => $byService,
        ]);
    }

    private function weeklyBuckets(Carbon $from, Carbon $to): array
    {
        // Always show exactly 4 calendar weeks (Mon–Sun), anchored from $from's Monday
        $cursor = $from->copy()->startOfWeek(Carbon::MONDAY);
        $weeks = [];

        for ($w = 1; $w <= 4; $w++) {
            $weekEnd = $cursor->copy()->addDays(6); // Monday to Sunday

            $rows = Booking::selectRaw("status, COUNT(*) as cnt")
                ->whereNotNull('preferred_date')
                ->whereBetween('preferred_date', [$cursor->toDateString(), $weekEnd->toDateString()])
                ->groupBy('status')->pluck('cnt', 'status');

            $rangeLabel = $cursor->format('M j') . ' – ' . $weekEnd->format('M j');

            $weeks[] = [
                'label'     => "Week {$w}",
                'range'     => $rangeLabel,
                'new'       => (int)($rows['pending']   ?? 0),
                'confirmed' => (int)($rows['confirmed'] ?? 0),
                'completed' => (int)($rows['completed'] ?? 0),
                'cancelled' => (int)($rows['cancelled'] ?? 0),
            ];

            $cursor->addDays(7);
        }
        return $weeks;
    }

    /**
     * Smart volume buckets for the Bookings panel.
     * Always 5 calendar weeks (Mon–Sun) anchored from the start date's Monday.
     * Each bucket has a total count + date-range label.
     */
    private function volumeBuckets(Carbon $from, Carbon $to): array
    {
        $cursor = $from->copy()->startOfWeek(Carbon::MONDAY);
        $buckets = [];

        for ($i = 0; $i < 5; $i++) {
            $weekEnd = $cursor->copy()->addDays(6);

            $count = Booking::whereNotNull('preferred_date')
                ->whereBetween('preferred_date', [$cursor->toDateString(), $weekEnd->toDateString()])
                ->count();

            $buckets[] = [
                'label' => $cursor->format('M j') . '-' . $weekEnd->format('j'),
                'count' => $count,
            ];

            $cursor->addDays(7);
        }

        return $buckets;
    }
}
