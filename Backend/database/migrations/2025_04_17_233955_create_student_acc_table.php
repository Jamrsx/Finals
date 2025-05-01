<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_acc', function (Blueprint $table) {
            $table->id();
            $table->string('student_id')->unique();
            $table->string('password');
            $table->string('Status')->default('1'); //! for active, 0 for inactive
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_acc');
    }
};
