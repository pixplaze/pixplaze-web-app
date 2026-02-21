<script>
  let {count = 0} = $props();
  let passive = $state(0);
  const array = $state([0]);
  const add = () => {
    array.push(array.length);
  }
  const remove = () => {
    array.pop();
  }
  const increment = () => {
    count++;
    passive++;
  }
  const decrement = () => {
    if (count < 1) {
      return;
    }

    count--;
    passive++;
  }
  const onClickPlus = () => {
    increment();
    add();
  }
  const onClickMinus = () => {
    decrement();
    remove();
  }
</script>

<button onclick={onClickPlus}>+</button>
<button onclick={onClickMinus}>-</button>
<p>Counter: {count}</p><p>Clicks count: {passive}</p>
<div>
  <p>Array: [{array}]</p>
</div>
<div>
  <p>Array length: {array.length}</p>
</div>