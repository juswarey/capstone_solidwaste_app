/**
 * API address.
 *
 * Use your PC's LAN IP (run `ipconfig` on Windows -> "IPv4 Address"),
 * NOT "localhost" — on a phone, localhost means the phone itself.
 *
 *   Physical phone (Expo Go) : http://192.168.1.10/solid/api
 *   Android emulator         : http://10.0.2.2/solid/api
 *   iOS simulator (Mac)      : http://localhost/solid/api
 *
 * "solid" = the folder name inside C:\xampp\htdocs\
 */
export const API_BASE = 'http://192.168.1.96:8080/solidwaste-main/api';

// Fallback map centre (Iligan City) used when a zone has no route path yet.
export const DEFAULT_REGION = {
  latitude: 8.228,
  longitude: 124.2452,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};
