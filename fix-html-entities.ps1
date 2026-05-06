$files = @(
    "d:\数据后台搭建\admin-app.js",
    "d:\数据后台搭建\modules\upload.js",
    "d:\数据后台搭建\modules\others.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # 替换条件判断中的 HTML 实体（不在字符串中的）
        # 使用正则表达式匹配不在引号内的实体
        
        # 替换 >= 的情况
        $content = $content -replace '(\s)&gt;=(\s)', '$1>=$2'
        $content = $content -replace '(\()&gt;=(\s)', '$1>=$2'
        $content = $content -replace '(\s)&gt;=(\))', '$1>=$2'
        
        # 替换 > 的情况
        $content = $content -replace '(\s)&gt;(\s)', '$1>$2'
        $content = $content -replace '(\()&gt;(\s)', '$1>$2'
        $content = $content -replace '(\s)&gt;(\))', '$1>$2'
        $content = $content -replace '(\[)&gt;(\s)', '$1>$2'
        
        # 替换 < 的情况
        $content = $content -replace '(\s)&lt;(\s)', '$1<$2'
        $content = $content -replace '(\()&lt;(\s)', '$1<$2'
        $content = $content -replace '(\s)&lt;(\))', '$1<$2'
        
        # 保存文件
        $content | Set-Content $file -Encoding UTF8 -NoNewline
        
        Write-Host "  ✓ Fixed $file" -ForegroundColor Green
    }
}

Write-Host "`n✅ All files processed!" -ForegroundColor Cyan
