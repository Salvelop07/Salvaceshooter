import { Ship } from "../ship/ship";
import Config from "../config";
import { getCanvasPosition } from "../utils";
import { Scene } from "../scenes/scene";
import {
  composeBehavior,
  FollowSteadyBehavior,
  Shoot,
  Behavior,
  PatrolAroundTarget
} from "../behavior";
import OffscreenCanvas from "../canvas";

// Elder race of aliens jara, jara
// Using the elder name couldn't be more confusing XD
export interface Elder extends Sprite {
  elderType: ElderType;
}

export function ElderPool(scene: Scene, ship: Ship): Pool {
  return kontra.pool({
    create() {
      let elder = kontra.sprite({
        // pass all properties ot the kontra.sprite ctor
        type: "enemy",
        // the enemies will need to have a reference
        // to the ship so they know its location
        ship,
        life: 100,
        width: 20,

        // damage animation TODO: extract
        dwd: 0,
        wasDamaged: false,

        // behaviors
        activeBehavior: undefined,

        update() {
          if (this.wasDamaged) {
            // TODO: extract this pattern
            // (increase counter and do something after a specific period of time)
            this.dwd += 1 / 60;
            if (this.dwd > 0.25) {
              this.wasDamaged = false;
              this.dwd = 0;
            }
          }
          this.advance();
        },
        takeDamage(damage: number) {
          // TODO: add take damage animation
          this.life -= damage;
          if (this.life < 0) this.ttl = 0;
          this.wasDamaged = true;
        },
        render(this: Elder) {
          let position = getCanvasPosition(this, this.ship);

          this.context.save();
          this.context.translate(position.x, position.y);
          this.context.rotate((Math.PI * 1) / 4);
          let pattern = getElderPattern();
          this.context.fillStyle = pattern;
          this.context.fillRect(0, 0, this.width, this.width);
          if (this.wasDamaged) {
            this.context.globalCompositeOperation = "source-atop";
            this.context.fillStyle = "rgba(255,0,0,0.5)";
            this.context.fillRect(0, 0, this.width, this.width);
          }
          this.context.restore();

          if (Config.debug && Config.showPath) {
            this.context.save();
            this.context.translate(
              position.x + this.width / 2,
              position.y + this.width / 2
            );
            this.context.beginPath();
            this.context.strokeStyle = "red";
            this.context.moveTo(0, 0);
            this.context.lineTo(this.dx * 20, this.dy * 20);
            this.context.stroke();
            this.context.restore();
          }

          if (Config.debug && Config.renderCollisionArea) {
            this.context.save();
            this.context.translate(position.x, position.y);
            this.context.rotate((Math.PI * 1) / 4);
            this.context.strokeStyle = "red";
            this.context.beginPath(); // start drawing a shape
            this.context.arc(
              this.width / 2,
              this.width / 2,
              this.width / 2,
              0,
              Math.PI * 2
            );
            this.context.stroke(); // outline the circle
            this.context.restore();
          }
        },
        init(args: any) {
          // load defaults based on type
          let elderType = args.elderType as ElderType;
          Object.assign(this, ElderCharacteristics[elderType]);
          Object.assign(this, args);
          if (this.elderType === ElderType.Sentry) {
            composeBehavior(elder, PatrolAroundTarget(/* orbit */ 300));
            composeBehavior(elder, FollowSteadyBehavior(ship));
            composeBehavior(elder, Shoot(scene, ship));
          } else if (this.elderType === ElderType.Drone) {
          } else {
            // mothership
          }
        }
      });
      return elder;
    },
    maxSize: Config.Elders.MaxNumber
  });
}

export enum ElderType {
  Drone,
  Sentry,
  MotherShip
}

interface EldersCharacteristics {
  [ElderType.Drone]: ElderCharacteristics;
  [ElderType.Sentry]: ElderCharacteristics;
  [ElderType.MotherShip]: ElderCharacteristics;
}
interface ElderCharacteristics {
  size: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  life: number;
  damage: number;
}

const ElderCharacteristics: EldersCharacteristics = {
  [ElderType.Drone]: {
    size: 10,
    speed: 4,
    maxSpeed: 6,
    acceleration: 0.1,
    life: 50,
    damage: 10
  },
  [ElderType.Sentry]: {
    size: 20,
    speed: 2,
    maxSpeed: 2,
    acceleration: 0, // move uniformly
    life: 100,
    damage: 30
  },
  [ElderType.MotherShip]: {
    size: 100,
    speed: 1,
    maxSpeed: 1,
    acceleration: 0, // move uniformly
    life: 500,
    damage: 100
  }
};

function getElderPattern() {
  let grey = { h: 0, s: 0, l: 50 };
  let granate = { h: 295, s: 100, l: 50 };
  let pattern = OffscreenCanvas.instance().getPatternBasedOnColors(
    grey,
    granate,
    20,
    20
  );
  return pattern;
}
