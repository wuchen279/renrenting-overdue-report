$files = @(
    "d:\数据后台搭建\admin-app.js",
    "d:\数据后台搭建\modules\upload.js",
    "d:\数据后台搭建\modules\others.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # 全局替换所有 HTML 实体（除了在字符串中的）
        # 注意：这个方法会替换所有的，包括字符串中的，需要后续手动检查
        
        # 替换 &gt; → >
        $content = $content -replace '&gt;', '>'
        
        # 替换 &lt; → <
        $content = $content -replace '&lt;', '<'
        
        # 替换 &amp; → & (但要保留 &amp;times; 等 HTML 实体)
        # 这个需要更谨慎，先不替换
        
        # 保存文件
        [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
        
        Write-Host "  ✓ Fixed $file" -ForegroundColor Green
    }
}

Write-Host "`n✅ All files processed!" -ForegroundColor Cyan
Write-Host "⚠️  请检查字符串中的 HTML 标签是否正确" -ForegroundColor Yellow
