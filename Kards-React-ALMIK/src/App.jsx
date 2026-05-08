import { Component } from 'react';
import TableRow from './components/TableRow';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allDecks: [{ groupName: "Основная колода", flashcards: [] }],
            activeDeck: 0,
            newDeckStr: '',
            frontInput: '',
            backInput: '',
            filterMode: 'all',
            currentIndex: 0,
            isFront: true
        };
    }

    componentDidMount() {
        const localData = localStorage.getItem('friend_flashcards');
        if (localData !== null) {
            this.setState({ allDecks: JSON.parse(localData) });
        }
        
        this.autoSave = setInterval(() => {
            localStorage.setItem('friend_flashcards', JSON.stringify(this.state.allDecks));
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.autoSave);
    }

    updateFront = (event) => this.setState({ frontInput: event.target.value });
    updateBack = (event) => this.setState({ backInput: event.target.value });
    updateNewDeckName = (event) => this.setState({ newDeckStr: event.target.value });

    createNewDeck = () => {
        const txt = this.state.newDeckStr.trim();
        if (!txt) return;

        this.setState((prevState) => ({
            allDecks: [...prevState.allDecks, { groupName: txt, flashcards: [] }],
            newDeckStr: '',
            activeDeck: prevState.allDecks.length,
            currentIndex: 0
        }));
    }

    selectDeck = (event) => {
        this.setState({ activeDeck: Number(event.target.value), currentIndex: 0, isFront: true });
    }

    pushCard = () => {
        if (this.state.frontInput === '' || this.state.backInput === '') return;

        const newCardObj = {
            id: Date.now(),
            front: this.state.frontInput,
            back: this.state.backInput,
            learned: false
        };

        const updatedDecks = this.state.allDecks.map((deck, idx) => {
            if (idx === this.state.activeDeck) {
                return { ...deck, flashcards: [...deck.flashcards, newCardObj] };
            }
            return deck;
        });

        this.setState({ allDecks: updatedDecks, frontInput: '', backInput: '' });
    }

    removeCard = (cardId) => {
        const updatedDecks = this.state.allDecks.map((deck, idx) => {
            if (idx === this.state.activeDeck) {
                return { ...deck, flashcards: deck.flashcards.filter(c => c.id !== cardId) };
            }
            return deck;
        });
        this.setState({ allDecks: updatedDecks });
    }

    editCard = (cardId) => {
        const currentDeck = this.state.allDecks[this.state.activeDeck];
        const cardToEdit = currentDeck.flashcards.find(c => c.id === cardId);
        
        if (cardToEdit) {
            this.setState({ frontInput: cardToEdit.front, backInput: cardToEdit.back });
            this.removeCard(cardId);
        }
    }

    markLearned = (cardId) => {
        const updatedDecks = this.state.allDecks.map((deck, idx) => {
            if (idx === this.state.activeDeck) {
                const updatedFlashcards = deck.flashcards.map(c => {
                    if (c.id === cardId) return { ...c, learned: !c.learned };
                    return c;
                });
                return { ...deck, flashcards: updatedFlashcards };
            }
            return deck;
        });
        this.setState({ allDecks: updatedDecks });
    }

    handleModeChange = (event) => {
        this.setState({ filterMode: event.target.value, currentIndex: 0, isFront: true });
    }

    mixCards = () => {
        const updatedDecks = this.state.allDecks.map((deck, idx) => {
            if (idx === this.state.activeDeck) {
                const mixed = [...deck.flashcards].sort(() => Math.random() - 0.5);
                return { ...deck, flashcards: mixed };
            }
            return deck;
        });
        this.setState({ allDecks: updatedDecks, currentIndex: 0, isFront: true });
    }

    turnCard = () => {
        this.setState((state) => ({ isFront: !state.isFront }));
    }

    goBack = () => {
        this.setState((state) => {
            if (state.currentIndex > 0) return { currentIndex: state.currentIndex - 1, isFront: true };
            return null;
        });
    }

    goForward = (limit) => {
        this.setState((state) => {
            if (state.currentIndex < limit - 1) return { currentIndex: state.currentIndex + 1, isFront: true };
            return null;
        });
    }

    render() {
        const { allDecks, activeDeck, newDeckStr, frontInput, backInput, filterMode, currentIndex, isFront } = this.state;
        let activeFlashcards = allDecks[activeDeck] ? allDecks[activeDeck].flashcards : [];
        
        let displayArr = [];
        if (filterMode === 'all') {
            displayArr = activeFlashcards;
        } else {
            displayArr = activeFlashcards.filter(c => c.learned === false);
        }

        let safeIndex = currentIndex >= displayArr.length ? 0 : currentIndex;
        let targetCard = displayArr[safeIndex];

        return (
            <div className="container">
                <h1>Flashcards</h1>

                <section>
                    <h2>Управление колодами</h2>
                    <select value={activeDeck} onChange={this.selectDeck} style={{marginBottom: '10px'}}>
                        {allDecks.map((elem, index) => <option key={index} value={index}>{elem.groupName}</option>)}
                    </select>
                    <input value={newDeckStr} onChange={this.updateNewDeckName} placeholder="Название новой колоды" />
                    <button onClick={this.createNewDeck}>Создать колоду</button>
                </section>

                <section>
                    <h2>Добавить карточку</h2>
                    <input value={frontInput} onChange={this.updateFront} placeholder="Вопрос или термин" />
                    <input value={backInput} onChange={this.updateBack} placeholder="Ответ или определение" />
                    <button onClick={this.pushCard}>Добавить карточку</button>
                </section>

                <section>
                    <h2>Все карточки</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Вопрос</th>
                                <th>Ответ</th>
                                <th>Отметить</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeFlashcards.map(itm => (
                                <TableRow 
                                    key={itm.id} 
                                    item={itm} 
                                    onToggle={() => this.markLearned(itm.id)} 
                                    onDelete={() => this.removeCard(itm.id)} 
                                    onEdit={() => this.editCard(itm.id)} 
                                />
                            ))}
                        </tbody>
                    </table>
                </section>

                <section>
                    <h2>Режим обучения</h2>
                    <select value={filterMode} onChange={this.handleModeChange}>
                        <option value="all">Все карточки</option>
                        <option value="unlearned">Только невыученные</option>
                    </select>
                    <button onClick={this.mixCards}>Перемешать</button>

                    <div className="card" onClick={this.turnCard}>
                        {!targetCard ? "Нет карточек" : (isFront ? targetCard.front : targetCard.back)}
                    </div>

                    <div className="nav-buttons">
                        <button onClick={this.goBack} disabled={safeIndex === 0 || !targetCard}>Назад</button>
                        <p style={{ margin: 0, alignSelf: 'center', fontWeight: 'bold' }}>
                            {displayArr.length === 0 ? "" : `Карточка ${safeIndex + 1} из ${displayArr.length}`}
                        </p>
                        <button onClick={() => this.goForward(displayArr.length)} disabled={safeIndex >= displayArr.length - 1 || !targetCard}>Вперед</button>
                    </div>
                </section>
            </div>
        );
    }
}

export default App;