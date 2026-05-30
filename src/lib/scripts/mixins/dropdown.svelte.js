// Этот класс инкапсулирует и реактивность, и поведение DOM
export class HoverDropdown {
  // Реактивное состояние
  isMouseInside = $state(false);
  isInFocus = $state(false);

  constructor(delay = 100) {
    this.delay = delay;
    this.hoverTimeout = null;
    this.focusTimeout = null;
  }

  // Метод-экшен для элемента-триггера
  trigger = (node) => {

    const onMouseEnter = () => {
      clearTimeout(this.hoverTimeout);
      this.isMouseInside = true;
    };

    const onMouseLeave = () => {
      this.hoverTimeout = setTimeout(() => {
        this.isMouseInside = false;
      }, this.delay);
    };

    const onFocus = () => {
      clearTimeout(this.focusTimeout);
      this.isInFocus = true;
    }

    const onBlur = () => {
      this.focusTimeout = setTimeout(() => {
        this.isInFocus = false;
      }, this.delay)
    }

    this.triggerElement = node;

    node.addEventListener('mouseenter', onMouseEnter);
    node.addEventListener('mouseleave', onMouseLeave);
    node.addEventListener('focus', onFocus);
    node.addEventListener('blur', onBlur);

    return {
      destroy() {
        node.removeEventListener('mouseenter', onMouseEnter);
        node.removeEventListener('mouseleave', onMouseLeave);
        node.removeEventListener('focus', onFocus);
        node.removeEventListener('blur', onBlur);
      }
    };
  };

  // Метод-экшен для самого контента меню (чтобы оно не закрывалось, пока мы на нем мышем)
  menu = (node) => {
    const onMouseEnter = () => clearTimeout(this.hoverTimeout);
    const onMouseLeave = () => {
      this.hoverTimeout = setTimeout(() => {
        this.isMouseInside = false;
      }, this.delay);
    };

    const onClickInside = (e) => {
      console.log(e);
      this.triggerElement.focus();
    };

    node.addEventListener('mouseenter', onMouseEnter);
    node.addEventListener('mouseleave', onMouseLeave);
    node.addEventListener('click', onClickInside);

    return {
      destroy() {
        node.removeEventListener('mouseenter', onMouseEnter);
        node.removeEventListener('mouseleave', onMouseLeave);
        node.removeEventListener('click', onClickInside);
      }
    };
  };
}
