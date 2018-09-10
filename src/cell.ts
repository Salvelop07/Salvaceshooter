import { createStaticParticle } from "./particles";
import {
  Position,
  getValueInRange,
  degreesToRadians,
  isObjectOutOfBounds,
  getCanvasPosition,
  Color
} from "./utils";
import Config from "./config";

export interface Cell extends Sprite {
  cellType: CellType;
  outerRadius: number;
}

export default function createCell(
  position: Position,
  cameraPosition: Position,
  cellType: CellType
) {
  // TODO: extract to utils
  // get arbirary direction/speed in angle...
  let angle = getValueInRange(0, 360);
  let cos = Math.cos(degreesToRadians(angle));
  let sin = Math.sin(degreesToRadians(angle));
  return kontra.sprite({
    type: SpriteType.Cell,
    cellType,
    x: position.x,
    y: position.y,
    dx: cos * 0.7 /*speed*/,
    dy: sin * 0.7 /*speed*/,
    outerRadius: 8,
    ttl: 240,
    render() {
      if (isObjectOutOfBounds(this, cameraPosition)) return;
      let position = getCanvasPosition(this, cameraPosition);

      // two concentric circles one filled one don't
      let alpha = 1 - (240 /*maxTTL*/ - this.ttl) / 240;
      let color = cellTypeToColor(cellType, alpha);
      this.context.save();
      this.context.strokeStyle = color;
      this.context.fillStyle = color;

      this.context.beginPath(); // start drawing a shape

      this.context.arc(
        position.x,
        position.y,
        2 /*InnerRadius*/,
        0,
        Math.PI * 2
      );
      this.context.stroke();
      this.context.fill();

      this.context.beginPath(); // start drawing a shape
      this.context.arc(
        position.x,
        position.y,
        this.outerRadius,
        0,
        Math.PI * 2
      );
      this.context.stroke(); // outline the circle

      this.context.restore();
    }
  });
}

export const enum CellType {
  Energy,
  Life
}

function cellTypeToColor(type: CellType, alpha: number): string {
  if (type === CellType.Energy) return Color.rgba(0, 255, 0, alpha);
  if (type === CellType.Life) return Color.rgba(255, 0, 0, alpha);
  return "yellow";
}

export function getRandomCellType(): CellType {
  const cellTypes = [CellType.Energy, CellType.Life];
  const index = Math.round(Math.random());
  return cellTypes[index];
}
