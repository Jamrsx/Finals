<?php

use App\Http\Controllers\AddCoordinator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CoordinatorController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/coordinatorAdd', [AddCoordinator::class, 'storeCoordinator']);
Route::post('/coordinator/login', [CoordinatorController::class, 'loginCoordinator']);


Route::post('/students', [CoordinatorController::class, 'storeStudent']);

Route::post('/tracks', [CoordinatorController::class, 'addTrack']);
Route::get('/ShowTracks', [CoordinatorController::class, 'showTracks']);
Route::put('/UpdateTrack/{id}', [CoordinatorController::class, 'updateTrack']);
Route::delete('/DeleteTrack/{id}', [CoordinatorController::class, 'deleteTrack']);

Route::post('/instructors', [CoordinatorController::class, 'addInstructor']);
Route::get('/ShowInstructor/{id}', [CoordinatorController::class, 'showInstructorById']);
Route::put('/UpdateInstructor/{id}', [CoordinatorController::class, 'updateInstructor']);
Route::delete('/DeleteInstructor/{id}', [CoordinatorController::class, 'deleteInstructor']);


