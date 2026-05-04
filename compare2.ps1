Set-Location "d:\数据后台搭建"
$linesA = Get-Content ".\report-2026-04.html"
$linesB = Get-Content ".\人人租2025-04-完整报告.html"
Write-Host "report-2026-04.html lines: $($linesA.Count)"
Write-Host "target lines: $($linesB.Count)"
$maxLines = [Math]::Max($linesA.Count, $linesB.Count)
$diffCount = 0
for ($i = 0; $i -lt $maxLines; $i++) {
    $lineA = if ($i -lt $linesA.Count) { $linesA[$i] } else { "" }
    $lineB = if ($i -lt $linesB.Count) { $linesB[$i] } else { "" }
    if ($lineA.Trim() -ne $lineB.Trim()) {
        $diffCount++
        if ($diffCount -le 40) {
            Write-Host "=== Line $($i+1) ==="
            $subA = $lineA.Trim()
            $subB = $lineB.Trim()
            if ($subA.Length -gt 200) { $subA = $subA.Substring(0, 200) + "..." }
            if ($subB.Length -gt 200) { $subB = $subB.Substring(0, 200) + "..." }
            Write-Host "  A: $subA"
            Write-Host "  B: $subB"
        }
    }
}
Write-Host "Total different lines: $diffCount"
