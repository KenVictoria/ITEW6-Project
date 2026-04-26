<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #111; }
        h1 { color: #FF6B00; font-size: 18px; margin: 0 0 8px; }
        .meta { color: #444; margin-bottom: 12px; font-size: 9px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #FF6B00; color: #fff; padding: 6px 4px; text-align: left; }
        td { border: 1px solid #ddd; padding: 4px; vertical-align: top; }
        tr:nth-child(even) td { background: #fafafa; }
    </style>
</head>
<body>
    <h1>CCS Student Profiling Report</h1>
    <div class="meta">Generated: {{ $generatedAt }} &mdash; {{ $students->count() }} record(s)</div>
    <table>
        <thead>
            <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Dept</th>
                <th>Skills</th>
                <th>Grade remarks</th>
                <th>Hobby</th>
                <th>Affiliations</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($students as $s)
                <tr>
                    <td>{{ $s->student_id }}</td>
                    <td>{{ $s->name }}</td>
                    <td>{{ $s->email }}</td>
                    <td>{{ $s->department }}</td>
                    <td>{{ is_array($s->skills) ? implode(', ', $s->skills) : '' }}</td>
                    <td>{{ $s->grade_remarks }}</td>
                    <td>{{ $s->hobby }}</td>
                    <td>{{ is_array($s->affiliations) ? implode(', ', $s->affiliations) : '' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
