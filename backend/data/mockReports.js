// Portfolio Summary: Loan portfolio by week/month/quarter/year
const portfolioSummary = [
    { date: '2024-01-07', totalLoans: 120, totalAmount: 5000000, repaid: 3500000, outstanding: 1500000, period: 'weekly' },
    { date: '2024-01-14', totalLoans: 130, totalAmount: 5200000, repaid: 3700000, outstanding: 1500000, period: 'weekly' },
    { date: '2024-01-31', totalLoans: 480, totalAmount: 20000000, repaid: 14000000, outstanding: 6000000, period: 'monthly' },
    { date: '2024-Q1', totalLoans: 1400, totalAmount: 60000000, repaid: 42000000, outstanding: 18000000, period: 'quarterly' },
    { date: '2023', totalLoans: 5600, totalAmount: 240000000, repaid: 168000000, outstanding: 72000000, period: 'yearly' },
];


// Member Analysis: Demographics, activity, loan status
const members = [
    { id: 1, name: "Alice Mwangi", joinDate: "2021-03-15", age: 34, gender: "F", status: "active", loans: 2, lastActive: "2024-06-01" },
    { id: 2, name: "John Otieno", joinDate: "2020-07-22", age: 41, gender: "M", status: "active", loans: 1, lastActive: "2024-05-28" },
    { id: 3, name: "Grace Wambui", joinDate: "2019-11-10", age: 29, gender: "F", status: "inactive", loans: 0, lastActive: "2023-12-15" },
    { id: 4, name: "Peter Kamau", joinDate: "2022-02-05", age: 38, gender: "M", status: "active", loans: 3, lastActive: "2024-06-02" },
    { id: 5, name: "Mary Njeri", joinDate: "2023-01-20", age: 27, gender: "F", status: "active", loans: 1, lastActive: "2024-05-30" },
];

// Financial Performance: Revenue, expenses, profit by period
const financialPerformance = [
    { period: '2024-01', revenue: 1200000, expenses: 800000, profit: 400000, type: 'monthly' },
    { period: '2024-02', revenue: 1300000, expenses: 850000, profit: 450000, type: 'monthly' },
    { period: '2024-Q1', revenue: 3500000, expenses: 2400000, profit: 1100000, type: 'quarterly' },
    { period: '2023', revenue: 14000000, expenses: 9500000, profit: 4500000, type: 'yearly' },
];

// Compliance Report: Regulatory ratios, issues, audit status
const complianceReport = [
    { date: '2024-01-31', capitalAdequacy: 0.16, liquidityRatio: 0.32, issues: 0, auditStatus: 'pass', period: 'monthly' },
    { date: '2024-02-29', capitalAdequacy: 0.15, liquidityRatio: 0.31, issues: 1, auditStatus: 'pass', period: 'monthly' },
    { date: '2024-Q1', capitalAdequacy: 0.15, liquidityRatio: 0.30, issues: 1, auditStatus: 'pass', period: 'quarterly' },
    { date: '2023', capitalAdequacy: 0.14, liquidityRatio: 0.28, issues: 2, auditStatus: 'fail', period: 'yearly' },
];

// Trend Analysis: Historical data for key metrics
const trendAnalysis = [
    { date: '2024-01', metric: 'loanGrowth', value: 0.05, period: 'monthly' },
    { date: '2024-02', metric: 'loanGrowth', value: 0.04, period: 'monthly' },
    { date: '2024-01', metric: 'memberGrowth', value: 0.03, period: 'monthly' },
    { date: '2024-02', metric: 'memberGrowth', value: 0.02, period: 'monthly' },
    { date: '2024-Q1', metric: 'loanGrowth', value: 0.045, period: 'quarterly' },
    { date: '2024-Q1', metric: 'memberGrowth', value: 0.025, period: 'quarterly' },
    { date: '2023', metric: 'loanGrowth', value: 0.048, period: 'yearly' },
    { date: '2023', metric: 'memberGrowth', value: 0.027, period: 'yearly' },
];

module.exports = {
    portfolioSummary,
    members,
    financialPerformance,
    complianceReport,
    trendAnalysis
}; 