let statusChart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('timestamp').textContent = new Date().toISOString();
    
    const loaded = await dataProcessor.loadData();
    if (!loaded) {
        alert('Error loading build data');
        return;
    }
    
    updateSummary();
    initializeCharts();
    populateFailures();
    populateCategories();
    populateFixes();
    populateCommands();
});

// Update summary cards
function updateSummary() {
    const stats = dataProcessor.getStats();
    const successRate = stats.total ? Math.round(stats.success * 100 / stats.total) : 0;
    
    document.getElementById('total-builds').textContent = stats.total;
    document.getElementById('failed-builds').textContent = stats.failed;
    document.getElementById('success-rate').textContent = successRate + '%';
    document.getElementById('affected-repos').textContent = stats.repos;
}

// Initialize charts
function initializeCharts() {
    const stats = dataProcessor.getStats();
    const ctx = document.getElementById('statusChart');
    
    if (statusChart) statusChart.destroy();
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [
                `Successful (${stats.success})`,
                `Failed (${stats.failed})`,
                `Pending (${stats.pending})`
            ],
            datasets: [{
                data: [stats.success, stats.failed, stats.pending],
                backgroundColor: ['#3fb950', '#f85149', '#0969da'],
                borderColor: '#0d1117',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#c9d1d9', font: { family: 'monospace' } }
                }
            }
        }
    });
}

// Populate failures table
function populateFailures() {
    const failures = dataProcessor.getFailedBuilds();
    const tbody = document.getElementById('failures-tbody');
    
    tbody.innerHTML = failures.map(f => `
        <tr>
            <td>${f.repo}</td>
            <td>${f.workflow}</td>
            <td><code>${f.branch}</code></td>
            <td><code>${f.sha}</code></td>
            <td><span class="badge-failed">FAILED</span></td>
        </tr>
    `).join('');
    
    // Add search functionality
    document.getElementById('failureSearch').addEventListener('keyup', e => {
        const search = e.target.value.toLowerCase();
        document.querySelectorAll('#failures-tbody tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(search) ? '' : 'none';
        });
    });
}

// Populate categories
function populateCategories() {
    const categories = dataProcessor.getCategorizedFailures();
    const container = document.getElementById('categories-list');
    
    container.innerHTML = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, count]) => `
            <div class="category-card">
                <strong>${cat}</strong>
                <div class="category-count">${count}</div>
            </div>
        `).join('');
}

// Populate quick fixes
function populateFixes() {
    const fixes = `# FacePrintPay Build Quick Fixes

## Priority 1: Dependency Issues
rm -rf node_modules package-lock.json
npm install

## Priority 2: Clear GitHub Actions Cache
gh repo list FacePrintPay --json name -q | while read repo; do
    gh api repos/FacePrintPay/$repo/actions/caches --method DELETE 2>/dev/null || true
done

## Priority 3: Update All Workflows
gh repo list FacePrintPay --json name -q | while read repo; do
    echo "📦 Updating $repo..."
    # Workspace-specific updates
done

## Priority 4: Verify Secrets
SECRETS=("GITHUB_TOKEN" "API_KEY" "DATABASE_URL")
for secret in "\${SECRETS[@]}"; do
    gh secret list --repo FacePrintPay/MyBuyO | grep -q "$secret" && \\
    echo "✅ $secret set" || echo "❌ $secret MISSING"
done

## Priority 5: Re-trigger Failed Builds
gh run list --repo FacePrintPay/<REPO> --status failure --json databaseId -q '.[].databaseId' | \\
while read id; do
    gh run rerun $id --repo FacePrintPay/<REPO>
done`;
    
    document.getElementById('quick-fixes-content').textContent = fixes;
}

// Populate commands
function populateCommands() {
    const commands = `# Debug Commands Reference

## View Failed Build Logs
gh run view <RUN_ID> --repo FacePrintPay/<REPO> --log

## List All Failed Runs
gh run list --repo FacePrintPay/<REPO> --status failure \\
  --json databaseId,name,conclusion

## Retry Single Build
gh run rerun <RUN_ID> --repo FacePrintPay/<REPO>

## Retry All Failed in Repo
gh run list --repo FacePrintPay/<REPO> --status failure \\
  --json databaseId -q '.[].databaseId' | \\
  xargs -I {} gh run rerun {} --repo FacePrintPay/<REPO>

## View Workflow File
gh workflow view <WORKFLOW_ID> --repo FacePrintPay/<REPO>

## Disable/Enable Workflow
gh workflow disable <WORKFLOW_ID> --repo FacePrintPay/<REPO>
gh workflow enable <WORKFLOW_ID> --repo FacePrintPay/<REPO>

## Check Runner Status
gh api repos/FacePrintPay/<REPO>/actions/runners

## Clear Repository Cache
gh api -X DELETE repos/FacePrintPay/<REPO>/actions/caches

## View Secrets
gh secret list --repo FacePrintPay/<REPO>

## Set Secret
gh secret set <SECRET_NAME> --body <SECRET_VALUE> --repo FacePrintPay/<REPO>`;
    
    document.getElementById('commands-content').textContent = commands;
}

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Copied to clipboard!');
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}
