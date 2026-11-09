<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Lowercases the emails already saved, as the app now saves them (see App\Concerns\NormalizesEmail).
 * It fails on the unique index if two accounts differ only in letter case: merge or rename one of
 * them by hand, then run it again.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('users')
            ->where('email', '<>', DB::raw('LOWER(email)'))
            ->update(['email' => DB::raw('LOWER(email)')]);
    }

    /**
     * Reverse the migrations. Nothing to do: the original letter case is lost.
     */
    public function down(): void
    {
        //
    }
};
