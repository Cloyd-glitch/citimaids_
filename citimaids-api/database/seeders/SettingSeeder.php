<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'business_name'     => 'CitiMaids Cleaning Services',
            'contact_number'    => '+971 52 634 9461',
            'additional_number' => '+971 58 175 3958',
            'business_email'    => 'info@citi-maids.com',
            'additional_email'  => 'citimaidsuae@gmail.com',
            'business_address'  => 'Aljazeera Tower, Room 45, Hamdan St, Abu Dhabi, UAE',
            'facebook_url'      => 'https://web.facebook.com/people/CitiMaids-Cleaning-Services/61550129471847/',
            'tiktok_url'        => 'https://www.tiktok.com/@citimaids?_t=8pO7VCQjaUy&_r=1',
            'description'       => 'Luxury residential, commercial, and maintenance services tailored across Abu Dhabi.',
            'timezone'          => 'Asia/Dubai',
            'currency'          => 'AED',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
