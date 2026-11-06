# food_app

Ember Kitchen mobile app — Expo Router + React Native, with a shared package and
a server stub.

## Requirements

- Node 22+
- Xcode with an iOS simulator
- Expo Go installed in the simulator

## Run the app

From the repo root:

```sh
npm run dev:mobile
```

That command starts Metro in LAN mode:
1. Scan the QR code using Expo Go on your physical phone (both your Mac and phone must be connected to the same Wi-Fi network).
2. Or press `i` in the terminal to launch the iOS simulator.

### Other run modes

- **iOS Simulator only (over `127.0.0.1`):**
  ```sh
  npm run dev:mobile:sim
  ```
- **Tunnel mode (if your Wi-Fi router isolates devices, e.g. office or guest Wi-Fi):**
  ```sh
  npm run dev:mobile:tunnel
  ```

## Checks

```sh
npm run typecheck
npm run lint
```

## Troubleshooting

- **"There was a problem running the requested project. The network connection
  was lost."** Metro is no longer reachable. Stop it and run
  `npm run dev:mobile` again — it connects the simulator over `127.0.0.1`
  instead of a LAN address.
- **Port 8081 already in use.**
  ```sh
  lsof -nP -iTCP:8081 -sTCP:LISTEN
  kill <PID>
  ```
  Or press `Ctrl+C` in the terminal that is running Metro.
- **Expo Go shows a red syntax error.** Fix the reported file and press `r`;
  the bundle rebuilds automatically.
