<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RoomController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Room::query()->orderBy('code')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:32', 'unique:rooms,code'],
            'name' => ['required', 'string', 'max:255'],
            'building' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:1'],
        ]);

        $room = Room::query()->create($data);

        return response()->json($room, Response::HTTP_CREATED);
    }

    public function show(Room $room): JsonResponse
    {
        return response()->json($room);
    }

    public function update(Request $request, Room $room): JsonResponse
    {
        $data = $request->validate([
            'code' => ['sometimes', 'string', 'max:32', 'unique:rooms,code,'.$room->id],
            'name' => ['sometimes', 'string', 'max:255'],
            'building' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:1'],
        ]);

        $room->update($data);

        return response()->json($room->fresh());
    }

    public function destroy(Room $room): Response
    {
        $room->delete();

        return response()->noContent();
    }
}
