$response = Invoke-RestMethod -Uri 'https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBuRDi7qjcR8FwbWscejFR4YxsF9v0y8Js'

Write-Host "`n====== DANH SÁCH MODELS CÓ SẴN ======`n" -ForegroundColor Green

foreach ($model in $response.models) {
    if ($model.supportedGenerationMethods -contains "generateContent") {
        Write-Host $model.name -ForegroundColor Yellow
        Write-Host "  Display Name: $($model.displayName)" -ForegroundColor Cyan
        Write-Host "  Methods: $($model.supportedGenerationMethods -join ', ')" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host "`n====== KẾT THÚC ======`n" -ForegroundColor Green
