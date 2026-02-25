// Data Processing Module
let buildsData = [];
let reposData = [];

// Load data on startup
async function loadData() {
    try {
        const [buildsRes, reposRes] = await Promise.all([
            fetch('data/builds.json'),
            fetch('data/repos.json')
        ]);
        
        buildsData = await buildsRes.json();
        reposData = await reposRes.json();
        
        console.log(`✅ Loaded ${buildsData.length} builds`);
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        return false;
    }
}

// Get statistics
function getStats() {
    return {
        total: buildsData.length,
        failed: buildsData.filter(b => b.conclusion === 'failure').length,
        success: buildsData.filter(b => b.conclusion === 'success').length,
        pending: buildsData.filter(b => !b.conclusion).length,
        repos: new Set(buildsData.map(b => b.repo)).size
    };
}

// Get failures by category
function getCategorizedFailures() {
    const failures = buildsData.filter(b => b.conclusion === 'failure');
    const categories = {};
    
    failures.forEach(f => {
        const cat = categorizeFailure(f.workflow);
        categories[cat] = (categories[cat] || 0) + 1;
    });
    
    return categories;
}

// Categorize failure
function categorizeFailure(workflow) {
    if (workflow.includes('test') || workflow.includes('jest') || workflow.includes('mocha'))
        return 'Test Failures';
    if (workflow.includes('build') || workflow.includes('compile'))
        return 'Build Issues';
    if (workflow.includes('deploy') || workflow.includes('release'))
        return 'Deployment Issues';
    if (workflow.includes('lint') || workflow.includes('format'))
        return 'Code Quality';
    if (workflow.includes('docker'))
        return 'Docker Issues';
    return 'Other';
}

// Get failed builds
function getFailedBuilds() {
    return buildsData.filter(b => b.conclusion === 'failure');
}

// Export functions
window.dataProcessor = {
    loadData,
    getStats,
    getCategorizedFailures,
    getFailedBuilds,
    categorizeFailure
};
