param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$GitArgs
)

$helpRequested = $GitArgs.Count -eq 0 -or $GitArgs -contains '--help' -or $GitArgs -contains '-h'

if ($helpRequested) {
  @(
    'Usage: .\gitfixauth.ps1 <git args...>',
    '',
    'Examples:',
    '  .\gitfixauth.ps1 status',
    '  .\gitfixauth.ps1 push origin worktree-HashBrownHub',
    '  .\gitfixauth.ps1 ls-remote origin HEAD'
  ) | Write-Output
  exit 0
}

$keysToClear = @(
  'GIT_ASKPASS',
  'SSH_ASKPASS',
  'VSCODE_GIT_IPC_HANDLE'
)

$keysToClear += Get-ChildItem Env: | Where-Object { $_.Name -like 'VSCODE_GIT_ASKPASS*' } | Select-Object -ExpandProperty Name

$originalValues = @{}

foreach ($key in $keysToClear | Select-Object -Unique) {
  $existing = [System.Environment]::GetEnvironmentVariable($key, 'Process')
  if ($null -ne $existing) {
    $originalValues[$key] = $existing
    Remove-Item "Env:$key" -ErrorAction SilentlyContinue
  }
}

try {
  & git @GitArgs
  exit $LASTEXITCODE
}
finally {
  foreach ($key in $originalValues.Keys) {
    [System.Environment]::SetEnvironmentVariable($key, $originalValues[$key], 'Process')
  }
}