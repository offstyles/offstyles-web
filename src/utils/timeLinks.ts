import type { Time } from "@/types/Time";

const playerLink = function(time : Time) {
  return `/players/${time.steamid}/?style=${time.style}`;
};
const mapLink = function(time : Time) {
  return `/maps/${time.map}/?style=${time.style}`;
}
const recordLink = function(time : Time) {
  return `/run/${time._id}/`;
}

export default {playerLink, mapLink, recordLink};
