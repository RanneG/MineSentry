# Backups Directory

This directory contains backup files for the MineSentry database and other critical data.

## Contents

- Database backups (`.db.backup` files)
- Configuration backups
- Other temporary backup files

## Notes

- Backup files are excluded from git (see `.gitignore`)
- Regular backups should be created before major changes
- Restore from backups using appropriate database utilities
