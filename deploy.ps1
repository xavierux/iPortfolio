# deploy.ps1
$Bucket = "s3://iportfolio-static-site-dev-92c7c0c2"

# Leer patrones de .gitignore
$Excludes = @()
Get-Content .gitignore | Where-Object { $_ -notmatch '^\s*#' -and $_ -notmatch '^\s*$' } | ForEach-Object {
    $pattern = $_.Trim()
    # Manejar directorios (terminan en / o son nombres como .git)
    if ($pattern -match '/$' -or $pattern -eq '.git') {
        $Excludes += "--exclude", "$pattern/*"
    } else {
        $Excludes += "--exclude", $pattern
    }
}

# Excluir explícitamente deploy.ps1 y .gitignore
$Excludes += "--exclude", "deploy.ps1"
$Excludes += "--exclude", ".gitignore"
$Excludes += "--exclude", ".vscode/*"
$Excludes += "--exclude", "indexOrigin.html"

# Mostrar los patrones excluidos para depuración
Write-Output "Exclusions: $Excludes"

# Ejecutar aws s3 sync con dryrun para probar
aws s3 sync . $Bucket --delete @Excludes