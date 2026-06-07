write-host "=========================================" -ForegroundColor Cyan
write-host "   Gaya ji Shoping Mart - EASY SETUP ASSISTANT" -ForegroundColor Cyan
write-host "=========================================" -ForegroundColor Cyan
write-host ""

write-host "STEP 1: Create Repo" -ForegroundColor Yellow
write-host "I cannot create a private repo for you without your password."
write-host "Please go to https://github.com/new and create a PRIVATE repository named 'folder-mart'."
write-host ""
$repoUrl = Read-Host "Paste the repository URL here (e.g. https://github.com/UJ-Studio/folder-mart.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    write-host "No URL provided. Exiting." -ForegroundColor Red
    exit
}

write-host ""
write-host "STEP 2: Linking & Pushing..." -ForegroundColor Yellow
try {
    git remote add origin $repoUrl
    git branch -M main
    git push -u origin main
    write-host "Code pushed successfully!" -ForegroundColor Green
} catch {
    write-host "Error pushing code. You might need to log in." -ForegroundColor Red
    write-host "Try running 'git push -u origin main' manually."
}

write-host ""
write-host "STEP 3: Opening Deployment Pages..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Open Render
write-host "Opening Render (Backend)..."
Start-Process "https://dashboard.render.com/select-repo?type=web"

# Open Netlify
write-host "Opening Netlify (Frontend)..."
Start-Process "https://app.netlify.com/start"

write-host ""
write-host "DONE! Follow the DEPLOYMENT_GUIDE.md for specific settings." -ForegroundColor Green
write-host "Press Enter to exit..."
Read-Host
