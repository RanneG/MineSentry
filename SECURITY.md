# Security Policy

## ⚠️ Security Warnings

**MineSentry deals with real Bitcoin and financial transactions. Use at your own risk.**

### Critical Security Considerations

1. **Never use on mainnet without thorough testing**
   - Always test on testnet first
   - Verify all functionality before mainnet deployment
   - Start with small amounts

2. **Protect your credentials**
   - Never commit `.env` files to version control
   - Use strong, unique passwords for Bitcoin RPC
   - Rotate credentials regularly
   - Never share RPC credentials publicly

3. **Private key security**
   - Never share private keys
   - Use hardware wallets for signer addresses
   - Store keys securely (encrypted, offline)
   - Use multi-signature wallets for bounty contracts

4. **Network security**
   - Run Bitcoin RPC on localhost only
   - Use firewall rules to restrict access
   - Enable SSL/TLS for remote connections
   - Regularly update Bitcoin Core

5. **Smart contract security**
   - Audit bounty contracts before deployment
   - Test all contract functions thoroughly
   - Verify multi-signature requirements
   - Monitor contract state regularly

## 🔒 Security Best Practices

### Bitcoin RPC Configuration

```conf
# bitcoin.conf - Secure configuration
server=1
rpcuser=strong_username_here
rpcpassword=very_strong_password_here  # Use openssl rand -hex 32
rpcbind=127.0.0.1
rpcallowip=127.0.0.1
# Never use rpcallowip=0.0.0.0
```

### Environment Variables

- Store `.env` files securely
- Use different credentials for testnet/mainnet
- Rotate passwords periodically
- Never log credentials

### Bounty Contract

- Use at least 3 signers for production
- Require 2+ signatures minimum
- Use hardware wallets for signers
- Monitor contract balance regularly
- Set up alerts for large payments

### Database Security

- Use strong database passwords
- Encrypt database at rest (if sensitive data)
- Regular backups
- Limit database access

## 🐛 Reporting Security Vulnerabilities

**DO NOT** open a public issue for security vulnerabilities.

### How to Report

1. **Email**: security@minesentry.org (if available)
   - Or contact repository maintainers privately

2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. **Response Time**: We aim to respond within 48 hours

4. **Disclosure**: We will coordinate disclosure after a fix is ready

### Security Issue Types

We're particularly interested in:

- **Authentication bypasses**
- **Authorization flaws**
- **SQL injection**
- **XSS vulnerabilities**
- **CSRF attacks**
- **Private key exposure**
- **Transaction manipulation**
- **Contract vulnerabilities**
- **RPC access issues**

## 🛡️ Security Checklist

Before deploying to mainnet:

- [ ] All tests pass
- [ ] Security audit completed
- [ ] Credentials changed from defaults
- [ ] RPC access restricted to localhost
- [ ] Strong passwords set
- [ ] Multi-signature configured
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Testnet testing completed
- [ ] Documentation reviewed

## 🔐 Key Management

### For Bounty Contract Signers

1. **Use hardware wallets** (Ledger, Trezor, etc.)
2. **Distribute keys** across trusted parties
3. **Use secure key storage** (encrypted, offline)
4. **Implement key rotation** procedures
5. **Monitor signer addresses** for unauthorized use

### For Development

1. **Never commit** private keys or credentials
2. **Use testnet** for development
3. **Separate testnet/mainnet** configurations
4. **Use environment variables** for secrets
5. **Review `.gitignore`** regularly

## 📋 Regular Security Tasks

- **Weekly**: Review access logs
- **Monthly**: Rotate credentials
- **Quarterly**: Security audit
- **Annually**: Full security review

## 🔍 Security Resources

- [Bitcoin Core Security](https://bitcoin.org/en/bitcoin-core/features/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

## ⚖️ Disclaimer

**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.**

Users are responsible for:
- Securing their own credentials
- Testing thoroughly before mainnet use
- Understanding the risks of Bitcoin transactions
- Auditing smart contracts
- Managing their own keys

**Use at your own risk. The developers are not responsible for any loss of funds.**

