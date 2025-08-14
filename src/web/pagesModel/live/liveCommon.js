import cssContent from '../../css/live-partition.css';

const addStyle = () => {
    const style = document.createElement('style');
    style.textContent = cssContent;
    document.head.appendChild(style);
}

export default {
    addStyle
}
