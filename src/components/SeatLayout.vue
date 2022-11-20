<script setup>
const onebytwo = ["A", "B", "C"];
const twobytwo = ["A", "B", "C", "D"];
const twobythree = ["A", "B", "C", "D", "E"];
</script>

<template>
  <div class="w-100 mx-auto">
    <h3>Select Seat(s):</h3>
    <ol class="cabin">
      <li v-for="c in 10" class="" :key="c">
        <ol class="seats" type="A">
          <li v-for="lay in twobythree" class="seat" :key="lay">
            <input type="checkbox" :disabled="c == 3 && lay == 'B'" :id="`${c}${lay}`" />
            <label :for="`${c}${lay}`">{{ c }}{{ lay }}</label>
          </li>
        </ol>
      </li>
    </ol>
  </div>
</template>

<style lang="scss" scoped>
.plane {
  margin: 20px auto;
  max-width: 300px;
}

.exit {
  position: relative;
  height: 50px;

  &:before,
  &:after {
    content: "EXIT";
    font-size: 14px;
    line-height: 18px;
    padding: 0px 2px;
    font-family: "Arial Narrow", Arial, sans-serif;
    display: block;
    position: absolute;
    background: green;
    color: white;
    top: 50%;
    transform: translate(0, -50%);
  }

  &:before {
    left: 0;
  }

  &:after {
    right: 0;
  }
}

ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

.seats {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
}

.seat {
  display: flex;
  flex: 0 0 14%;
  padding: 5px;
  position: relative;

  &:nth-child(3) {
    margin-right: 14%;
  }

  & input[type="checkbox"] {
    position: absolute;
    opacity: 0;

    &:checked + label {
      background: #bada55;
      -webkit-animation-name: rubberBand;
      animation-name: rubberBand;
      animation-duration: 300ms;
      animation-fill-mode: both;
    }

    &:disabled + label {
      background: #dddddd;
      text-indent: -9999px;
      overflow: hidden;
      padding: 4px;

      &:after {
        content: "X";
        text-indent: 0;
        position: absolute;
        top: 4px;
        left: 50%;
        color: #090909;
        transform: translate(-50%, 0%);
      }

      &:hover {
        box-shadow: none;
        cursor: not-allowed;
      }
    }
  }

  & label {
    display: block;
    position: relative;
    width: 100%;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    line-height: 1.5rem;
    padding: 4px;
    background: #8f2323;
    color: white;
    border-radius: 5px;
    animation-duration: 300ms;
    animation-fill-mode: both;

    // &:before {
    //   content: "";
    //   position: absolute;
    //   width: 75%;
    //   height: 75%;
    //   top: 1px;
    //   left: 50%;
    //   transform: translate(-50%, 0%);
    //   background: rgba(255, 255, 255, 0.4);
    //   border-radius: 3px;
    // }

    &:hover {
      cursor: pointer;
      box-shadow: 0 0 0px 2px #5c6aff;
    }
  }
}

@-webkit-keyframes rubberBand {
  0% {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }

  30% {
    -webkit-transform: scale3d(1.25, 0.75, 1);
    transform: scale3d(1.25, 0.75, 1);
  }

  40% {
    -webkit-transform: scale3d(0.75, 1.25, 1);
    transform: scale3d(0.75, 1.25, 1);
  }

  50% {
    -webkit-transform: scale3d(1.15, 0.85, 1);
    transform: scale3d(1.15, 0.85, 1);
  }

  65% {
    -webkit-transform: scale3d(0.95, 1.05, 1);
    transform: scale3d(0.95, 1.05, 1);
  }

  75% {
    -webkit-transform: scale3d(1.05, 0.95, 1);
    transform: scale3d(1.05, 0.95, 1);
  }

  100% {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
}

@keyframes rubberBand {
  0% {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }

  30% {
    -webkit-transform: scale3d(1.25, 0.75, 1);
    transform: scale3d(1.25, 0.75, 1);
  }

  40% {
    -webkit-transform: scale3d(0.75, 1.25, 1);
    transform: scale3d(0.75, 1.25, 1);
  }

  50% {
    -webkit-transform: scale3d(1.15, 0.85, 1);
    transform: scale3d(1.15, 0.85, 1);
  }

  65% {
    -webkit-transform: scale3d(0.95, 1.05, 1);
    transform: scale3d(0.95, 1.05, 1);
  }

  75% {
    -webkit-transform: scale3d(1.05, 0.95, 1);
    transform: scale3d(1.05, 0.95, 1);
  }

  100% {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
}

.rubberBand {
  -webkit-animation-name: rubberBand;
  animation-name: rubberBand;
}
</style>
