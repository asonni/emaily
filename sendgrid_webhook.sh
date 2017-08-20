# chmod +x sendgrid_webhook.sh
function localtunnel {
  lt -s emailyasonnily --port 5000
}
until localtunnel; do
  echo "localtunnel server crashed"
  sleep 2
done
