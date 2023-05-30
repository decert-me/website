export default function Tab(props) {
    
    const { tabs, selectTab, setSelectTab, hideCase } = props;

    return (
        <div className="tab">
            <ul>
            {
                tabs.map((e,i) => 
                    <li 
                        key={e.key} 
                        className={selectTab === e.key ? "active" : ""}
                        onClick={() => setSelectTab(e.key)}
                    >
                        {e.label}
                    </li>
                )
            }
            </ul>
        </div>
    )
}