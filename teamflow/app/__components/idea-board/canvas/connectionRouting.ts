export type RoutableRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Point = { x: number; y: number };

const OBSTACLE_MARGIN = 16;

function overlaps1d(aMin: number, aMax: number, bMin: number, bMax: number) {
  return aMin < bMax && bMin < aMax;
}

/** Nudges a bend coordinate outside any obstacle rect it would otherwise cut through. */
function clearObstacles(
  bendCoord: number,
  crossAxisMin: number,
  crossAxisMax: number,
  obstacles: RoutableRect[],
  isVerticalSegment: boolean,
) {
  let nextCoord = bendCoord;
  for (const obstacle of obstacles) {
    const obstacleMin = isVerticalSegment ? obstacle.x : obstacle.y;
    const obstacleMax = isVerticalSegment
      ? obstacle.x + obstacle.width
      : obstacle.y + obstacle.height;
    const obstacleCrossMin = isVerticalSegment ? obstacle.y : obstacle.x;
    const obstacleCrossMax = isVerticalSegment
      ? obstacle.y + obstacle.height
      : obstacle.x + obstacle.width;

    const cutsThrough =
      nextCoord > obstacleMin &&
      nextCoord < obstacleMax &&
      overlaps1d(crossAxisMin, crossAxisMax, obstacleCrossMin, obstacleCrossMax);
    if (!cutsThrough) continue;

    const before = obstacleMin - OBSTACLE_MARGIN;
    const after = obstacleMax + OBSTACLE_MARGIN;
    nextCoord = Math.abs(before - bendCoord) <= Math.abs(after - bendCoord) ? before : after;
  }
  return nextCoord;
}

/** Routes a connector as a single right-angle bend (or a straight line when the boxes are already aligned). */
export function getOrthogonalRoute(from: RoutableRect, to: RoutableRect, obstacles: RoutableRect[]) {
  const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const isHorizontalPrimary = Math.abs(dx) >= Math.abs(dy);

  let start: Point;
  let end: Point;
  if (isHorizontalPrimary) {
    start = { x: dx >= 0 ? from.x + from.width : from.x, y: fromCenter.y };
    end = { x: dx >= 0 ? to.x : to.x + to.width, y: toCenter.y };
  } else {
    start = { x: fromCenter.x, y: dy >= 0 ? from.y + from.height : from.y };
    end = { x: toCenter.x, y: dy >= 0 ? to.y : to.y + to.height };
  }

  const isAligned = isHorizontalPrimary ? start.y === end.y : start.x === end.x;
  if (isAligned) {
    return { points: [start, end], labelPoint: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 } };
  }

  let bendCoord = isHorizontalPrimary ? (start.x + end.x) / 2 : (start.y + end.y) / 2;
  const crossMin = isHorizontalPrimary ? Math.min(start.y, end.y) : Math.min(start.x, end.x);
  const crossMax = isHorizontalPrimary ? Math.max(start.y, end.y) : Math.max(start.x, end.x);
  bendCoord = clearObstacles(bendCoord, crossMin, crossMax, obstacles, isHorizontalPrimary);

  const bend: Point = isHorizontalPrimary ? { x: bendCoord, y: start.y } : { x: start.x, y: bendCoord };
  const bendEnd: Point = isHorizontalPrimary ? { x: bendCoord, y: end.y } : { x: end.x, y: bendCoord };

  return {
    points: [start, bend, bendEnd, end],
    labelPoint: {
      x: (bend.x + bendEnd.x) / 2,
      y: (bend.y + bendEnd.y) / 2,
    },
  };
}

export function pointsToPath(points: Point[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
}
