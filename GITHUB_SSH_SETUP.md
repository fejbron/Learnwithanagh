# GitHub SSH Setup - Quick Guide

## Step 1: Add SSH Key to GitHub

1. **Copy your SSH public key** (already displayed above):
   ```
   ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEm9OJiUvU/deBwKNIzI1z6cNF6XPiPKnCgFWePOPMpZ fejbroni@umat.edu.gh
   ```

2. **Go to GitHub:**
   - Visit: https://github.com/settings/keys
   - Click "New SSH key"

3. **Add the key:**
   - Title: "Mac - Learnwithanagh"
   - Key: Paste the entire key above
   - Click "Add SSH key"

## Step 2: Update Git Remote

The remote URL will be changed from HTTPS to SSH automatically.

## Step 3: Test Connection

After adding the key to GitHub, test with:
```bash
ssh -T git@github.com
```

You should see: "Hi fejbron! You've successfully authenticated..."

## Step 4: Push Your Code

```bash
git push origin main
```

---

## Alternative: Use Personal Access Token (Quick Fix)

If you prefer to stick with HTTPS:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control)
4. Copy the token
5. When pushing, use the token as your password:
   ```bash
   git push origin main
   # Username: fejbron
   # Password: [paste your token here]
   ```

Or update the remote URL to include your token:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/fejbron/Learnwithanagh.git
```
