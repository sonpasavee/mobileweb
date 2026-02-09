import { Redirect, Route } from 'react-router-dom'
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'

import ListExpenses from './pages/ListExpenses'
import AddExpense from './pages/AddExpense'
import EditExpense from './pages/EditExpense'

/* Core CSS */
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'
import '@ionic/react/css/palettes/dark.system.css'

import './theme/variables.css'

setupIonicReact()

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>

        {/* หน้าแรก */}
        <Route exact path="/">
          <Redirect to="/list" />
        </Route>

        {/* รายการรายรับรายจ่าย */}
        <Route exact path="/list">
          <ListExpenses />
        </Route>

        {/* เพิ่มข้อมูล */}
        <Route exact path="/add">
          <AddExpense />
        </Route>

        {/* แก้ไขข้อมูล */}
        <Route exact path="/edit/:id">
          <EditExpense />
        </Route>

      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
)

export default App
