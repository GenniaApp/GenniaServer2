const forceStartOK = [1, 2, 2, 3, 3, 4, 5, 5, 6];
function dirName(item) {
  let from = item.from,
    to = item.to;
  if (from.x === to.x) {
    if (from.y < to.y) return "right";
    else return "left";
  } else {
    if (from.x < to.x) return "down";
    else return "up";
  }
}


const svg_host = '<svg style="color: #FFA726; display: inline-block;font-size: inherit;height: 1em;overflow: visible;vertical-align: -0.125em;font-size: 13px;margin-right:.5rem"xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><defs><style>.fa-secondary{opacity:.4}</style></defs><path d="M544 464v32a16 16 0 0 1-16 16H112a16 16 0 0 1-16-16v-32a16 16 0 0 1 16-16h416a16 16 0 0 1 16 16z" class="fa-secondary"/><path d="M640 176a48 48 0 0 1-48 48 49 49 0 0 1-7.7-.8L512 416H128L55.7 223.2a49 49 0 0 1-7.7.8 48.36 48.36 0 1 1 43.7-28.2l72.3 43.4a32 32 0 0 0 44.2-11.6L289.7 85a48 48 0 1 1 60.6 0l81.5 142.6a32 32 0 0 0 44.2 11.6l72.4-43.4A47 47 0 0 1 544 176a48 48 0 0 1 96 0z" class="fa-primary"/></svg>' 

const svg_temp = '<svg style="color: #FF9800; display: inline-block;font-size: inherit;height: 1em;overflow: visible;vertical-align: -0.125em;font-size: 13px;margin-left:.5rem" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><defs><style>.fa-secondary{opacity:.4}</style></defs><path d="M448 384c-.1 16.4-13 32-32.1 32H32.08C13 416 .09 400.4 0 384a31.25 31.25 0 0 1 8.61-21.71c19.32-20.76 55.47-52 55.47-154.29 0-77.7 54.48-139.9 127.94-155.16V32a32 32 0 1 1 64 0v20.84C329.42 68.1 383.9 130.3 383.9 208c0 102.3 36.15 133.53 55.47 154.29A31.27 31.27 0 0 1 448 384z" class="fa-secondary"/><path d="M160 448h128a64 64 0 0 1-128 0z" class="fa-primary"/></svg>'


// export everthing
export { forceStartOK, dirName, svg_host, svg_temp };
