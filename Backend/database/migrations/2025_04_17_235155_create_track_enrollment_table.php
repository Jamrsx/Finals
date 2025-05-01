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
        Schema::create('track_enrollment', function (Blueprint $table) {
            $table->id();
            $table->string('student_id')->index();
            $table->integer('track_id');
            $table->string('track_name');
            $table->string('status')->default('Pending'); 
            $table->timestamps();

            
            $table ->foreign('student_id')
                ->references('student_id')
                ->on('student_acc')
                ->onDelete('cascade')->onUpdate('cascade');

                
            $table ->foreign('track_id')
            ->references('track_id')
            ->on('track')
            ->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('track_enrollment');
    }
};
