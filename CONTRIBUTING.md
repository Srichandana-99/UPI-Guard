# Contributing to UPI-Guard

We love contributions! Whether you're fixing a bug, adding a feature, or improving documentation, your help is appreciated.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/YOUR_USERNAME/upiguard.git`
3. **Create a branch**: `git checkout -b feature/amazing-feature`
4. **Make your changes**
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Pull Request**: Open a PR on GitHub

## 📋 Development Guidelines

### Code Style

#### Python (Backend)
- Follow PEP 8
- Use type hints
- Maximum line length: 88 characters
- Use f-strings for string formatting

```python
# Good
def process_transaction(amount: float, user_email: str) -> dict:
    """Process a transaction with fraud detection."""
    result = evaluate_fraud_risk({"amount": amount, "email": user_email})
    return {"status": "success", "risk_score": result["risk_score"]}

# Bad
def process_transaction(amount, user_email):
    result = evaluate_fraud_risk({"amount": amount, "email": user_email})
    return {"status": "success", "risk_score": result["risk_score"]}
```

#### JavaScript (Frontend)
- Use ES6+ features
- Prefer functional components with hooks
- Use descriptive variable names
- Maximum line length: 100 characters

```jsx
// Good
const TransactionList = ({ transactions, loading }) => {
    const [filter, setFilter] = useState('all');
    
    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => 
            filter === 'all' || txn.type === filter
        );
    }, [transactions, filter]);

    if (loading) return <Loader />;
    
    return (
        <div className="transaction-list">
            {filteredTransactions.map(txn => (
                <TransactionItem key={txn.id} transaction={txn} />
            ))}
        </div>
    );
};

// Bad
function TransactionList(props) {
    const [filter, setFilter] = useState('all');
    var filtered = props.transactions.filter(txn => 
        filter === 'all' || txn.type === filter
    );
    
    if (props.loading) return <Loader />;
    
    return (
        <div className="transaction-list">
            {filtered.map(txn => (
                <TransactionItem key={txn.id} transaction={txn} />
            ))}
        </div>
    );
}
```

### Testing

#### Backend Tests
- Write unit tests for all new functions
- Use pytest for testing
- Aim for >80% code coverage

```python
# tests/test_ml_service.py
import pytest
from app.services.ml_service import evaluate_fraud_risk

def test_fraud_detection_legitimate():
    transaction = {
        "amount": 1000,
        "hour_of_day": 14,
        "location_mismatch": 0,
        "is_new_receiver": 0,
        "velocity_1h": 1
    }
    
    result = evaluate_fraud_risk(transaction)
    
    assert result["risk_score"] < 0.5
    assert result["decision"] == "Approve"
    assert result["is_fraudulent"] == False

def test_fraud_detection_suspicious():
    transaction = {
        "amount": 50000,
        "hour_of_day": 2,
        "location_mismatch": 1,
        "is_new_receiver": 1,
        "velocity_1h": 10
    }
    
    result = evaluate_fraud_risk(transaction)
    
    assert result["risk_score"] > 0.5
    assert result["decision"] in ["Block", "Review"]
```

#### Frontend Tests
- Use React Testing Library
- Test user interactions
- Mock API calls

```jsx
// tests/components/TransactionList.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionList } from '../components/TransactionList';

test('renders transaction list', () => {
    const mockTransactions = [
        { id: '1', amount: 1000, type: 'sent', date: '2024-01-01' }
    ];
    
    render(<TransactionList transactions={mockTransactions} loading={false} />);
    
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    expect(screen.getByText('sent')).toBeInTheDocument();
});

test('filters transactions', () => {
    const mockTransactions = [
        { id: '1', amount: 1000, type: 'sent', date: '2024-01-01' },
        { id: '2', amount: 2000, type: 'received', date: '2024-01-02' }
    ];
    
    render(<TransactionList transactions={mockTransactions} loading={false} />);
    
    fireEvent.click(screen.getByText('Sent'));
    
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    expect(screen.queryByText('₹2,000')).not.toBeInTheDocument();
});
```

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add biometric authentication support
fix: resolve OTP email delivery issue
docs: update API documentation
refactor: improve fraud detection performance
test: add unit tests for location service
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, browser, version
2. **Steps to reproduce**: Clear, numbered steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Error messages**: Full error text
6. **Screenshots**: If applicable

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Environment
- OS: [e.g., macOS 13.0]
- Browser: [e.g., Chrome 120.0]
- Version: [e.g., v1.2.0]

## Steps to Reproduce
1. Go to...
2. Click on...
3. Enter...
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable, add screenshots

## Additional Context
Any other relevant information
```

## ✨ Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** first
2. **Provide clear description** of the feature
3. **Explain the use case** and benefits
4. **Consider implementation** suggestions

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Any other relevant information
```

## 🔧 Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Local Development
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Database
createdb upiguard
python -c "from app.db.database import engine, Base; Base.metadata.create_all(engine)"
```

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:e2e
```

## 📝 Documentation

- Keep documentation up-to-date
- Use clear, concise language
- Include code examples
- Add screenshots for UI changes

## 🏗️ Architecture Decisions

### Major Changes
For significant architectural changes, please:

1. **Open an issue** first to discuss
2. **Explain the problem** you're solving
3. **Propose solution** with alternatives
4. **Consider impact** on existing code
5. **Get feedback** before implementing

### Code Review Process
1. **Self-review** your code first
2. **Ensure tests pass**
3. **Update documentation**
4. **Request review** from maintainers
5. **Address feedback** promptly

## 🚀 Release Process

### Version Bumping
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update version numbers in:
  - `package.json` (frontend)
  - `requirements.txt` (backend)
  - `README.md`

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version numbers updated
- [ ] CHANGELOG.md updated
- [ ] Tag created in Git

## 🤝 Code of Conduct

### Our Pledge
- Be inclusive and respectful
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

### Expected Behavior
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior
- Harassment, trolling, or discriminatory language
- Personal attacks or insults
- Public or private harassment
- Publishing others' private information
- Any other conduct which could reasonably be considered inappropriate

## 📞 Getting Help

- **Discord**: [Join our Discord](https://discord.gg/upiguard)
- **GitHub Issues**: [Create an issue](https://github.com/your-username/upiguard/issues)
- **Email**: dev@upiguard.com

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

---

Thank you for contributing to UPI-Guard! 🚀
