# dans le dossier du repo local
echo "FROM n8nio/n8n:latest" > Dockerfile
git add Dockerfile
git commit -m "Add Dockerfile for n8n deployment"
git push origin main
