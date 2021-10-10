import 'bootstrap-utilities'
import { render, html, TemplateResult } from "lit"
import page from 'page'
import axios from 'axios'
import { JsonDecoder } from 'ts.data.json'

interface Pokemon {
  id: number,
  name: string
  sprites: Sprites
}

interface Sprites {
  front_default: string
}

type Location = 'Home' | 'About' | 'Topics' | 'Pokemon' | 'NotFound'

let topic = ''

let count = 0

let _pokemon: Pokemon = {
  id: -1,
  name: '',
  sprites: {
    front_default: ''
  }
}

let loadingPokemon = false

let location: Location = 'Home'

const reRender = () => render(app(), document.getElementById('app'))

const links = () => html`
  <span>
    <a @click=${() => page('/')} class="m-2">home</a>
    <a @click=${() => page('/about')} class="m-2">about</a>
    <a @click=${() => page('/topics')} class="m-2">topics</a>
    <a @click=${() => page('/pokemon')} class="m-2">pokemon</a>
  </span>
`
const counter = () => html`
  <div>
    <button
      @click=${() => { count++; reRender() }}
      class="m-2"
    >inc</button>
    <div class="m-2">${count}</div>
    <button
      @click=${() => { count--; reRender() }}
      class="m-2"
    >dec</button>
  </div>
`

const home = () => counter()

const about = () => html`
  <div class='m-2'>This is the about page</div>
`

const topics = () => html`
  <div class='m-2'>
    <div>This is the topic page</div>
    <div class='my-2'><b>Topics</b></div>
    <div>Topic is: ${topic}</div>
  </div>
`

const pokemonDecoder = JsonDecoder.object<Pokemon>(
  {
    id: JsonDecoder.number,
    name: JsonDecoder.string,
    sprites: JsonDecoder.object<Sprites>(
      {
        front_default: JsonDecoder.string
      },
      'Sprites'
    )
  },
  'Pokemon'
)

const getPokemon = (id = '1') => {
  axios.get(`https://pokeapi.co/api/v2/pokemon-form/${id}/`)
    .then(({ data }) => {
      pokemonDecoder.fold(
        pokemon => _pokemon = pokemon,
        err => {
          console.error(err);
          return _pokemon = {
            id: -1,
            name: 'error getting pokemon',
            sprites: { front_default: '' }
          }
        },
        data
      )
      loadingPokemon = false
      reRender()
    })
    .catch(error => {
      _pokemon = {
        id: -1,
        name: 'error getting pokemon',
        sprites: { front_default: '' }
      }
      console.error(error)
      loadingPokemon = false
      reRender()
    })
}

const pokemon = () => html`
  <div class='m-2'>
    <div>This is the pokemon page</div>
    <div class='my-2'>
      <b>Pokemon Details </b>
      ${loadingPokemon === true ? 'loading...' : ''}
    </div>
    <div> Pokemon details are
      <i @click=${() => {
    loadingPokemon = true
    reRender()
    getPokemon((Math.random() * 500).toFixed(0))
  }}>(refresh)</i>:
    </div>
    <div class="m-2">
      <!-- need to add 'crossorigin' see: -->
      <!-- https://github.com/parcel-bundler/parcel/issues/6503#issuecomment-896596413 -->
      <img src=${_pokemon.sprites.front_default} crossorigin="anonymous" />
      <div>${_pokemon.name}</div>
    </div>
  </div>
`

const notFound = () => html`
  <div class="m-2">Page not found</div>
`

const router = (loc: Location) => {
  switch (loc) {
    case 'Home':
      return home()
    case 'About':
      return about()
    case 'Topics':
      return topics()
    case 'Pokemon':
      return pokemon()
    case 'NotFound':
    default:
      return notFound()
  }
}

const app = () => html`
  <div class='m-2'>Hello World</div>
  ${links()}
  ${router(location)}
`

render(
  app(),
  document.getElementById('app')
)

page('/', () => {
  location = 'Home'
  reRender()
})
page('/about', () => {
  location = 'About'
  reRender()
})
page('/topics', () => {
  location = 'Topics'
  topic = ''
  reRender()
})
page('/topics/:topic', (ctx) => {
  location = 'Topics'
  topic = ctx.params.topic
  reRender()
})
page('/pokemon', () => {
  location = 'Pokemon'
  if (_pokemon.id === -1) {
    loadingPokemon = true
    getPokemon()
  }
  reRender()
})
page('*', () => {
  location = 'NotFound'
  reRender()
})
page()
