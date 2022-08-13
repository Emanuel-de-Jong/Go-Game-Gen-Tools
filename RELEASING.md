1. Copy `client` dir content.
2. Copy `README.md`
3. Copy `server/humanai/katago` dir.
4. Remove `gtp_logs` and `KataGoData` in `katago` dir.
5. Run `gradle build` in `server/humanai` dir.
6. Copy `server/humanai/build/libs/humanai-0.0.1-SNAPSHOT.jar`.
7. Rename `humanai-0.0.1-SNAPSHOT.jar` to `server.jar`.
8. Copy `HumanAI.bat` from last release.