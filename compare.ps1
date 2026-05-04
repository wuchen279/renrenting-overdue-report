$fileA = Get-Content 'd:\数据后台搭建\report-2026-04.html' -Raw -Encoding UTF8
$fileB = Get-Content 'd:\数据后台搭建\人人租2025-04-完整报告.html' -Raw -Encoding UTF8
Write-Host "report-2026-04.html lines: $(($fileA -split "`n").Count)"
Write-Host "人人租2025-04-完整报告.html lines: $(($fileB -split "`n").Count)"

$linesA = Get-Content 'd:\数据后台搭建\report-2026-04.html' -Encoding UTF8
$linesB = Get-Content 'd:\数据后台搭建\人人租2025-04-完整报告.html' -Encoding UTF8

$maxLines = [Math]::Max($linesA.Count, $linesB.Count)
$diffCount = 0
for ($i = 0; $i -lt $maxLines; $i++) {
    $lineA = if ($i -lt $linesA.Count) { $linesA[$i] } else { "<MISSING>" }
    $lineB = if ($i -lt $linesB.Count) { $linesB[$i] } else { "<MISSING>" }
    if ($lineA.Trim() -ne $lineB.Trim()) {
        $diffCount++
        if ($diffCount -le 30) {
            Write-Host "=== Line $($i+1) DIFFERS ==="
            Write-Host "  A: $($lineA.Trim().Substring(0, [Math]::Min(150, $lineA.Trim().Length)))"
            Write-Host "  B: $($lineB.Trim().Substring(0, [Math]::Min(150, $lineB.Trim().Length)))"
            Write-Host ""
        }
    }
}
Write-Host "Total different lines: $diffCount"
