import { Injectable, WritableSignal } from '@angular/core';

type StringTarget = WritableSignal<string> | WritableSignal<string | null>;
export interface AnimationStringInput {
  target: StringTarget,
  text: string,
  prefix?: string,
  delay?: number,
}

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private readonly stringTimeouts = new WeakMap<StringTarget, ReturnType<typeof setTimeout>>();
  private readonly animationTexts = new WeakMap<StringTarget, string>();

  typewrite(input: AnimationStringInput): void {
    const { target, text } = input;
    const delay = input.delay ?? 60;
    const prefix = input.prefix ?? '';

    if (this.animationTexts.get(target) === text) return;
    clearTimeout(this.stringTimeouts.get(target));
    this.animationTexts.set(target, text);
    target.set(prefix);

    let i = 0;
    const type = () => {
      target.set(text.slice(0, i));
      if (i++ < text.length) {
        this.stringTimeouts.set(target, setTimeout(type, delay));
      } else {
        this.animationTexts.delete(target);
      }
    };
    type();
  }
}
