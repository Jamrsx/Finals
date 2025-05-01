<?php

namespace App\Http\Controllers;

use App\Models\Coordinator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AddCoordinator extends Controller
{
    public function storeCoordinator(Request $request)
    {
        // Validate input
        $validatedData = $request->validate([
            'coordinator_id' => 'required|unique:coordinator,coordinator_id',
            'password' => 'required|min:6',
            'lname' => 'required|string',
            'fname' => 'required|string',
            'mname' => 'nullable|string',
            'suffix' => 'nullable|string',
            'email' => 'required|email|unique:coordinator,email',
            'gender' => 'required|string',
        ]);

        DB::beginTransaction();

        try {
            $coordinator = Coordinator::create([
                'coordinator_id' => $validatedData['coordinator_id'],
                'lname' => $validatedData['lname'],
                'fname' => $validatedData['fname'],
                'mname' => $validatedData['mname'],
                'suffix' => $validatedData['suffix'],
                'email' => $validatedData['email'],
                'gender' => $validatedData['gender'],
                'password' => Hash::make($validatedData['password']),
            ]);

            DB::commit();

            return response()->json(['message' => 'Coordinator successfully added.'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to save coordinator. ' . $e->getMessage()], 500);
        }
    }
}
