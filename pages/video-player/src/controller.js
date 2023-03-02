export default class Controller{
    #view 
    #camera
    #worker
    #blinkCunter = 0
    constructor({ view, worker, camera }) {
        this.#view = view 
        this.#camera = camera
        this.#worker = this.#configureWorker(worker)

        this.#view.configureOnBtnClick(this.onBtnStart.bind(this))
    }
    static async initialize(deps) {
        const controller = new Controller(deps)
        controller.log('not yet detecting eye blink! click in the button to start')
        return controller.init()
    }
    #configureWorker(worker) {
        let ready = false
        worker.onmessage = ({data}) =>{
            if ('READY' === data) {
                console.log('a')
                this.#view.enableButton()
                ready= true
                return;
            }
            const blinked = data.blinked
            this.#blinkCunter += blinked
            // this.#view.togglePlayVideo()
            // console.log('blinked', blinked)
        }

        return { send (msg) {
            if(!ready) return;
            worker.postMessage(msg)
        }}
    }
    async init() {
        // console.log('a')
    }
    loop() {
        const video = this.#camera.video
        const img = this.#view.getVideoFrame(video)
        this.#worker.send(img)
        this.log(`detecting eye blink...`)
        setTimeout(() => this.loop(), 100)
    }
    log(text) {
        const times = `      - blinked times: ${this.#blinkCunter}`
        this.#view.log(`status: ${text}`. concat(this.#blinkCunter ? times: ""))
    }
    onBtnStart(){
        this.log('initializing detection')
        this.#blinkCunter = 0
        this.loop()
    }
}