<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('coordinator', function (Blueprint $table) {
            $table->id();
            $table->string('coordinator_id')->unique();
            $table->string('lname');
            $table->string('fname');
            $table->string('mname')->nullable();
            $table->string('suffix')->nullable();
            $table->enum('gender',['Male', 'Female']);
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamps();
        });

        // Insert default coordinator
        DB::table('coordinator')->insert([
            'coordinator_id' => '001',
            'lname' => 'Dela Cruz',
            'fname' => 'Juan',
            'mname' => 'Santos',
            'suffix' => null,
            'gender' => 'Male',
            'email' => 'juandelacruz@example.com',
            'password' => Hash::make('123456'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coordinator');
    }
};
