import type { Time } from "@/types/Time";

const playerLink = function(time : Time) {
  return `/players/${time.steamid}/`;
};
const mapLink = function(time : Time) {
  return `/maps/${time.map}/`
}

export default {playerLink, mapLink};