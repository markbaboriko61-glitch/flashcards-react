import { Component } from 'react';

export default class TableRow extends Component {
    render() {
        return (
            <tr>
                <td>{this.props.item.front}</td>
                <td>{this.props.item.back}</td>
                <td>
                    <input 
                        type="checkbox" 
                        checked={this.props.item.learned} 
                        onChange={this.props.onToggle} 
                    />
                </td>
                <td>
                    <button onClick={this.props.onEdit}>Ред.</button>
                    <button style={{ marginLeft: '5px' }} onClick={this.props.onDelete}>Удалить</button>
                </td>
            </tr>
        );
    }
}