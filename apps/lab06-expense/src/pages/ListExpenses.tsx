import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonNote,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon
} from '@ionic/react';
import { addOutline, pencilOutline, trashOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useHistory } from 'react-router-dom';

interface Expense {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

const ListExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const history = useHistory();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'expenses'), snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];

      setExpenses(data);
    });

    return () => unsub();
  }, []);

  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const deleteExpense = async (id: string) => {
    if (window.confirm('ต้องการลบรายการนี้หรือไม่?')) {
      await deleteDoc(doc(db, 'expenses', id));
    }
  };

  return (
    <IonPage>
      {/* Header */}
      <IonHeader>
        <IonToolbar
          style={{
            '--background': 'linear-gradient(135deg, #667eea, #764ba2)'
          }}
        >
          <IonTitle style={{ color: '#fff', fontWeight: 600 }}>
            รายรับ – รายจ่าย
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding"
        style={{ '--background': '#f4f6f8' }}
      >
        {/* ปุ่มเพิ่ม */}
        <IonButton
          expand="block"
          style={{
            '--background': 'linear-gradient(135deg, #43e97b, #38f9d7)',
            '--border-radius': '14px',
            fontWeight: 600
          }}
          onClick={() => history.push('/add')}
        >
          <IonIcon icon={addOutline} slot="start" />
          เพิ่มรายการ
        </IonButton>

        {/* Summary */}
        <IonGrid className="ion-margin-top">
          <IonRow>
            <IonCol size="6">
              <IonCard
                style={{
                  background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  color: '#fff',
                  borderRadius: '16px'
                }}
              >
                <IonCardContent>
                  <h4>รายรับรวม</h4>
                  <h2>฿ {totalIncome.toLocaleString()}</h2>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="6">
              <IonCard
                style={{
                  background: 'linear-gradient(135deg, #fa709a, #fee140)',
                  color: '#fff',
                  borderRadius: '16px'
                }}
              >
                <IonCardContent>
                  <h4>รายจ่ายรวม</h4>
                  <h2>฿ {totalExpense.toLocaleString()}</h2>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* List */}
        <IonList lines="none">
          {expenses.map(exp => (
            <IonItem
              key={exp.id}
              style={{
                marginBottom: '12px',
                borderRadius: '14px',
                '--background': '#ffffff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
              }}
            >
              <IonLabel>
                <h3 style={{ fontWeight: 600 }}>{exp.title}</h3>
                <p>{exp.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</p>
              </IonLabel>

              <IonNote
                slot="end"
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: exp.type === 'income' ? '#2dd36f' : '#eb445a'
                }}
              >
                {exp.type === 'income' ? '+' : '-'}฿
                {exp.amount.toLocaleString()}
              </IonNote>

              <IonButton
                fill="clear"
                color="medium"
                onClick={() => history.push(`/edit/${exp.id}`)}
              >
                <IonIcon icon={pencilOutline} />
              </IonButton>

              <IonButton
                fill="clear"
                color="danger"
                onClick={() => deleteExpense(exp.id)}
              >
                <IonIcon icon={trashOutline} />
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ListExpenses;
