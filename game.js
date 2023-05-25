// Classes
class balls {
    timing: number
    hited: boolean

    constructor() {
        this.timing = 0
        this.hited = false
    }

    // enemy send me a ball
    sendBall(str: string) {
        if (str.length > 1) {
            if (str.charAt(0) == "S" && str.charAt(1) == "B") {
                let speed = ""
                for (let l = 4; l < str.length; l++) {
                    if (str.charAt(l) == " ") break
                    speed += str.charAt(l)
                }
                if (str.charAt(3) == "2") ball.fall(-1, parseInt(str.charAt(2)), parseInt(speed))
                else ball.fall(parseInt(str.charAt(3)), parseInt(str.charAt(2)), parseInt(speed))
            }
        }
    }

    // successed swing and make ball move
    go(way: number, start: number, speed: number) {

        led.plot(start, 3)
        basic.pause(speed)
        let m = 2
        while (m >= 0) {
            //make afterimage
            shadow[4 - (m + 1)] = start * 10 + 10 + m + 1

            //make ricochet
            if (start + way > 4 || start + way < 0) way *= -1

            start = start + way
            led.plot(start, m)
            basic.pause(speed)
            m -= 1
        }
        basic.pause(10)
        led.unplot(start, 0)
        if (way == 1) way = 2
        if (way == -1) way = 1
        for (let i = 0; i < 6; i++) {
            radio.sendString("SB" + start.toString() + way.toString() + speed.toString() + " " + gameRoom.strRoomCode)
            basic.pause(10)
        }
    }
    fall(way: number, start: number, speed: number) {
        if (player.playing == false) return
        led.plot(start, 0)
        basic.pause(speed)
        for (let n = 1; n < 5; n++) {
            // make afterimage
            shadow[n - 1] = start * 10 + 10 + n - 1
            // make ricochet
            if (start + way > 4 || start + way < 0) way *= -1

            start = start + way
            if (n != 4) led.plot(start, n)
            if (n == 3) {
                this.timing = 40
                for (let times = 1; times < 40; times++) {
                    if (this.hited == true) break
                    basic.pause(speed / 35)
                    this.timing -= 1
                }
            } else basic.pause(speed)
        }
        basic.pause(50)
        if (player.pLocation != start) led.unplot(start, 4)
        if (this.hited == false) {
            if (gameRoom.state == "PF" || gameRoom.state == "PS") {
                radio.sendString("Score " + gameRoom.strRoomCode)
                if (gameRoom.state == "PF") gameRoom.scoreP("Second")
                else gameRoom.scoreP("First")
            }
        }
    }
}
class games {
    state: string
    roomCode: number
    scoreRed: number
    scoreBlue: number

    page: number

    constructor() {
        radio.setGroup(148)
        this.roomCode = -1
        this.scoreRed = 0
        this.scoreBlue = 0
        this.state = "N"

        this.page = 0
        this.showPage()
    }
    get strRoomCode() {
        return this.roomCode.toString()
    }

    showPage() {
        if (this.page == 0) {
            basic.showLeds(`
            . . # . .
            . . # . .
            # . # . #
            # # # # #
            . . # . .
            `)
        }
        else {
            basic.showLeds(`
            . # # # .
            # . . . #
            # . # . #
            # . . . #
            . # # # .
            `)
        }
    }

    practice() {
        basic.clearScreen()
        basic.pause(500)
        this.state = "pct"
        player.pLocation = 2
        led.plot(2, 4)
        player.playing = true
        while (this.state == "pct") {
            ball.fall(randint(-1, 1), randint(0, 4), randint(180, 600))
            basic.pause(500)
        }

    }


    stop() {
        this.roomCode = -1
        this.scoreBlue = 0
        this.scoreRed = 0
        this.state = "N"
    }

    matchmaking() {
        this.state = "Finding"
        ledState = "findRoom"
        basic.pause(4000)
        if (this.roomCode == -1) {
            this.roomCode = randint(11, 100007)
            this.state = "Created"
            for (let o = 0; o < 15; o++) {
                if (this.state != "Created") break

                radio.sendString("Created " + gameRoom.strRoomCode)
                basic.pause(1000)
            }
            basic.pause(3000)
            if (this.state == "Created") {
                basic.showString("Failed")
                this.roomCode = -1
                this.state = "N"
                this.showPage()
            }
            return
        }
    }
    scoreP(at: string) {
        if (this.scoreBlue == 3 || this.scoreRed == 3) player.playing == false
        if (at == "First") {
            this.scoreRed += 1

            if (this.scoreRed == 4) {
                if (gameRoom.state == "PF") {
                    stop()
                    soundState = "win"
                    basic.showString("You Win!")
                    gameRoom.showPage()
                }
                else {
                    stop()
                    soundState = "lose"
                    basic.showString("You Lose!")
                    gameRoom.showPage()
                }
            }
            else {
                ledState = "Score"
                soundState = "score"
                basic.pause(5000)
                player.pLocation = 2
                led.plot(2, 4)
            }
        }
        else {
            this.scoreBlue += 1

            if (this.scoreBlue == 4) {
                if (gameRoom.state == "PS") {
                    stop()
                    soundState = "win"
                    basic.showString("You Win!")
                }
                else {
                    stop()
                    soundState = "lose"
                    basic.showString("You Lose!")
                }
            }
            else {
                ledState = "Score"
                soundState = "score"
                basic.pause(5000)
                player.pLocation = 2
                led.plot(2, 4)
            }
        }

    }
}
class players {
    playing: boolean
    swingCool: boolean
    swingSuccess: number
    pLocation: number
    pBright: number
    constructor() {
        this.playing = false
        this.swingCool = false
        this.swingSuccess = -5;
        this.pLocation = 2
        this.pBright = 185
    }

    // start game and place player
    start() {
        this.playing = true
        led.plotBrightness(this.pLocation, 4, this.pBright)
    }
    stop() {
        this.playing = false
        this.pLocation = 2
    }
    // move player
    move(loc: number, moves: number) {
        if (loc + moves >= 5 || loc + moves < 0) {
            return
        }
        led.unplot(loc, 4)
        this.pLocation = loc + moves
        led.plotBrightness(this.pLocation, 4, this.pBright)
    }

    // try swing. ( way : dx )
    swing(way: number) {
        if (led.pointBrightness(this.pLocation, 3) > 220) {
            this.swingSuccess = way
            ball.hited = true
            basic.pause(40)
            this.swingSuccess = -5
            music.playTone(330, music.beat(BeatFraction.Eighth))
            music.playTone(392, music.beat(BeatFraction.Half))
            basic.pause(300)
            ball.hited = false
        }
    }

    // swing motion
    swingMotion() {
        basic.pause(1000) // wait for next swing
        this.swingCool = false
        this.pBright = 185
        led.plotBrightness(this.pLocation, 4, this.pBright)
    }
}

const player = new players();
const ball = new balls();
const gameRoom = new games();

function soundCustom(ty: string) {
    switch (ty) {
        case "countdownstart":
            music.playTone(523, music.beat(BeatFraction.Whole))
            break
        case "score":
            music.playTone(262, music.beat(BeatFraction.Half))
            music.playTone(392, music.beat(BeatFraction.Half))
            music.playTone(523, music.beat(BeatFraction.Half))
            break
        case "win":
            music.playTone(392, music.beat(BeatFraction.Whole))
            music.playTone(440, music.beat(BeatFraction.Whole))
            music.playTone(392, music.beat(BeatFraction.Half))
            music.playTone(494, music.beat(BeatFraction.Half))
            music.playTone(523, music.beat(BeatFraction.Whole))
            break
        case "lose":
            music.playTone(466, music.beat(BeatFraction.Whole))
            music.playTone(330, music.beat(BeatFraction.Whole))
            music.playTone(277, music.beat(BeatFraction.Double))
            break
    }
}
// Show LED
function ledCustom(ty: string) {
    switch (ty) {
        case "findRoom":
            basic.showLeds(`
            . . . . .
            . . # . .
            . # . # .
            . . # . .
            . . . . .
            `)
            basic.pause(500)
            if (ledState == "N") return
            basic.showLeds(`
            . . . . .
            . # . # .
            . . . . .
            . # . # .
            . . . . .
            `)
            basic.pause(500)
            break
        case "countdown":
            for (let k = 3; k >= 1; k -= 1) {
                basic.showNumber(k)
                music.playTone(330, music.beat(BeatFraction.Quarter))
            }

            soundState = "countdownstart"
            ledState = "Finish"
            player.pLocation = 2
            break
        case "Score":
            player.pLocation = -2
            basic.clearScreen()
            basic.showString(gameRoom.scoreRed.toString() + ":" + gameRoom.scoreBlue.toString())
            ledState = "N"

            break
        case "Finish":
            basic.clearScreen()
            ledState = "N"
            break
    }
}

// game stop
function stop() {
    player.stop()
    gameRoom.stop()
}
// get state of Room or Game variables ( text parsing )
function getRoomState(text: string) {
    tmp = ""
    for (let i = 0; i <= text.length; i++) {
        if (text.charAt(i) == " ") {
            return tmp
        }
        tmp = "" + tmp + text.charAt(i)
    }
    return tmp
}

// get RoomCode of Room ( text parsing )
function getRoomCode(text: string) {
    codchg = false
    tmp2 = ""
    for (let j = 0; j <= text.length - 1; j++) {
        if (codchg == true) {
            tmp2 = "" + tmp2 + text.charAt(j)
        } else if (text.charAt(j) == " ") {
            codchg = true
        }
    }
    return tmp2.length > 0 ? parseInt(tmp2) : -1
}

// Swing
input.onButtonPressed(Button.AB, function () {
    // roll > 25 : right   roll < -25 : left   else : front
    if (gameRoom.state != "PF" && gameRoom.state != "PS" && gameRoom.state != "pct") {
        return
    }
    if (player.swingCool == false) {
        player.swingCool = true
        player.pBright = 30
        led.plotBrightness(player.pLocation, 4, player.pBright)
        if (input.rotation(Rotation.Roll) >= 25) {
            player.swing(1)
        } else if (input.rotation(Rotation.Roll) <= -25) {
            player.swing(-1)
        } else {
            player.swing(0)
        }
    }
})


// radio communication
radio.onReceivedString(function (receivedString) {
    if (gameRoom.state == "Finding") {
        // gameRoom Find action
        if (getRoomState(receivedString) == "Created") {
            gameRoom.roomCode = getRoomCode(receivedString)
            gameRoom.state = "RF"
            ledState = "Finish"
            radio.sendString("Join " + gameRoom.roomCode.toString())
            basic.pause(50)
            ledState = "countdown"
            basic.pause(6000)
            player.start()
            gameRoom.state = "PF"
        }
    } else if (gameRoom.state == "Created") {
        // a player joiend your room
        if (getRoomState(receivedString) == "Join") {
            if (getRoomCode(receivedString) == gameRoom.roomCode) {
                gameRoom.state = "RS"
                ledState = "Finish"
                basic.pause(50)
                ledState = "countdown"
                basic.pause(6000)
                player.start()
                gameRoom.state = "PS"
                basic.pause(500)
                ball.fall(randint(-1, 1), randint(0, 4), 500)
            }
        }
    } else if (getRoomCode(receivedString) == gameRoom.roomCode) {
        gotsnd = receivedString
    }
})

// Button Event
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (gameRoom.state == "pct") {
        gameRoom.state = "N"
        player.playing = false
        player.pLocation = -5
        basic.pause(2450)
        gameRoom.showPage()
        return
    }
    if (eventcool != 0) {
        return
    }
    if (gameRoom.state == "N") {
        if (gameRoom.page == 0) {
            eventcool = 1
        } else {
            eventcool = 2
        }
    }
})

input.onButtonPressed(Button.A, function () {
    if (player.playing == true) {
        player.move(player.pLocation, -1)
    } else {
        if (gameRoom.state == "N") {
            gameRoom.page = Math.abs(gameRoom.page - 1) % 2
            gameRoom.showPage()
        }
    }
})


input.onButtonPressed(Button.B, function () {
    if (player.playing == true) {
        player.move(player.pLocation, 1)
    } else {
        if (gameRoom.state == "N") {
            gameRoom.page = Math.abs(gameRoom.page + 1) % 2
            gameRoom.showPage()
        }
    }
})

// supporting make afterimage of balls
function makeShadow (shadowNum: number) {
    if (shadow[shadowNum] != 0) {
        music.playTone(262 + shadowNum * 20, music.beat(BeatFraction.Sixteenth))
        shadowBall(shadowNum, shadow[shadowNum])
    }
    basic.pause(2)
}

// Make Afterimage
function shadowBall (dNum: number, location: number) {
    shadow[dNum] = 0
    bright = 240
    while (bright >= 1) {
        bright = led.pointBrightness(Math.idiv(location, 10) - 1, location % 10)
        if (bright <= 1) {
            break;
        }
        bright += 0 - 9
        led.plotBrightness(Math.idiv(location, 10) - 1, location % 10, bright)
        basic.pause(2)
    }
    led.unplot(Math.idiv(location, 10) - 1, location % 10)
}

let bright = 0
let codchg = false
let tmp = ""
let eventcool = 0
let shadow: number[] = []
let ledState = ""
let tmp2 = ""

let soundState = "N"
let gotsnd = "None"
ledState = "N"
shadow = [
0,
0,
0,
0
]

loops.everyInterval(2, function () {
    makeShadow(0)
})

loops.everyInterval(2, function () {
    makeShadow(1)
})

loops.everyInterval(2, function () {
    makeShadow(2)
})

loops.everyInterval(2, function () {
    makeShadow(3)
})


// show LED
basic.forever(function () {
    if (ledState != "N") {
        ledCustom(ledState)
    }
    basic.pause(2)
})

// Background Sound
basic.forever(function () {
    if (soundState != "N") {
        soundCustom(soundState)
        soundState = "N"
    }
    basic.pause(2)
})

// Swing Cooldown
basic.forever(function () {
    if (player.swingCool == true) {
        player.swingMotion()
    }
    basic.pause(30)
})

// Check Player hit ball
basic.forever(function () {
    if (player.swingSuccess != -5) {
        if (gameRoom.state != "pct") {
            ball.go(player.swingSuccess, player.pLocation, 150 + Math.abs(40 - ball.timing) * 11)
        } else {
            soundState = "score"
        }
        player.swingSuccess = -5
    }
    basic.pause(5)
})

// Match Making
loops.everyInterval(5, function () {
    if (eventcool == 1) {
        gameRoom.matchmaking()
        basic.pause(500)
        eventcool = 0
    } else if (eventcool == 2) {
        eventcool = 0
        gameRoom.practice()
        basic.pause(500)
    }
})

// Sended Ball
loops.everyInterval(10, function () {
    if (gotsnd != "None"){
        if (getRoomState(gotsnd) == "Score") {
            if (gameRoom.state == "PF") {
                gameRoom.scoreP("First")
            } else {
                gameRoom.scoreP("Second")
            }
            basic.pause(1500)
            ball.fall(randint(-1, 1), randint(0, 4), 550)
        } else {
            ball.sendBall(gotsnd)
        }
        basic.pause(200)
        gotsnd = "None"
    }
})
