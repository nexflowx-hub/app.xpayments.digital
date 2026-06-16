#!/bin/bash
cd /home/z/my-project
while true; do
  node node_modules/.bin/next dev -p 3000 2>&1
  EXITCODE=$?
  echo "[$(date)] Server exited with code $EXITCODE, restarting in 1s..."
  sleep 1
done
