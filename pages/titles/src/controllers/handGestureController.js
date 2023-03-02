import {prepareRunChecker} from "../../../../lib/shared/util.js"

const { shouldRun: scrollShoudRun } = prepareRunChecker({timerDelay: 200})
const { shouldRun: clickShoudRun } = prepareRunChecker({timerDelay: 400})
export default class HandGestureController {
  #view
  #service
  #camera
   #lastDirection = {
    direction: '',
    y: 0
  }
  constructor({view, service, camera}) {
    this.#view = view
    this.#service = service
    this.#camera = camera
  }
  async init() {
    return this.#loop()
  }

  #scrollPage(direction) {
    const pixelsPerScroll = 100
    
    if(this.#lastDirection.direction === direction) {
      if(direction === 'scroll-down' && this.#lastDirection.y < 2300){
        this.#lastDirection.y = this.#lastDirection.y + pixelsPerScroll
      }
      else if(direction === 'scroll-up' && this.#lastDirection.y > 0) {
        this.#lastDirection.y = this.#lastDirection.y - pixelsPerScroll
      }
    }
    else {
      this.#lastDirection.direction = direction
    }
    this.#view.scrollPage(this.#lastDirection.y)
  }

  async #estimateHands(){
    try {
      const hands = await this.#service.estimateHands(this.#camera.video)
      this.#view.clear()
      if (hands?.length) this.#view.drawResults(hands)
      for await(const {event, x, y} of this.#service.detectGestures(hands)){
        if(event === 'click') {
          if(!clickShoudRun) continue
          this.#view.clickOnElement(x,y)
          continue
        }
        if(event.includes('scroll')) {
          if(!scrollShoudRun()) continue
          this.#scrollPage(event)
        }
      }
    } catch (error) {
      console.error('deu ruim fio', error)
    }
  }
  
  async #loop() {
    await this.#service.initializeDetector()
    await this.#estimateHands()
    this.#view.loop(this.#loop.bind(this))
  }

  static async initialize(deps) {
    const controller = new HandGestureController(deps)
    return controller.init()
  }
}