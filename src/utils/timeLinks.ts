import type { Time } from "@/types/Time";

const playerLink = function(time : Time) {
  return `/players/${time.steamid}/`;
};
const mapLink = function(time : Time) {
  return `/maps/${time.map}/`
}
const recordLink = function(time : Time) {
  return `/run/${time._id}/`;
}

export default {playerLink, mapLink, recordLink};