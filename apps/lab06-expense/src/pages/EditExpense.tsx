import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon
} from '@ionic/react';
import { pencilOutline, saveOutline, trashOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, useHistory } from 'react-router-dom';

const EditExpense: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpense = async () => {
      const ref = doc(db, 'expenses', id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title);
        setAmount(data.amount);
      }

      setLoading(false);
    };

    loadExpense();
  }, [id]);

  const updateExpense = async () => {
    if (!title || amount === null || amount <= 0) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    await updateDoc(doc(db, 'expenses', id), {
      title,
      amount: Number(amount)
    });

    alert('อัปเดตข้อมูลเรียบร้อย ✅');
    history.push('/list');
  };

  const deleteExpense = async () => {
    if (window.confirm('ต้องการลบรายการนี้หรือไม่?')) {
      await deleteDoc(doc(db, 'expenses', id));
      history.push('/list');
    }
  };

  if (loading) return null;

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
            แก้ไขรายการ
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding"
        style={{ '--background': '#f4f6f8' }}
      >
        <IonCard
          style={{
            borderRadius: '18px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
          }}
        >
          <IonCardContent>

            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <IonIcon
                icon={pencilOutline}
                style={{ fontSize: 36, color: '#667eea' }}
              />
            </div>

            {/* ชื่อรายการ */}
            <IonInput
              label="ชื่อรายการ"
              labelPlacement="floating"
              value={title}
              onIonChange={e => setTitle(e.detail.value!)}
            />

            {/* จำนวนเงิน */}
            <IonInput
              className="ion-margin-top"
              label="จำนวนเงิน (บาท)"
              labelPlacement="floating"
              type="number"
              value={amount ?? ''}
              onIonChange={e => setAmount(Number(e.detail.value))}
            />

            {/* ปุ่มอัปเดต */}
            <IonButton
              expand="block"
              className="ion-margin-top"
              style={{
                '--background': 'linear-gradient(135deg, #43e97b, #38f9d7)',
                '--border-radius': '14px',
                fontWeight: 600
              }}
              onClick={updateExpense}
            >
              <IonIcon icon={saveOutline} slot="start" />
              อัปเดตข้อมูล
            </IonButton>

            {/* ปุ่มลบ */}
            <IonButton
              expand="block"
              className="ion-margin-top"
              color="danger"
              fill="outline"
              onClick={deleteExpense}
            >
              <IonIcon icon={trashOutline} slot="start" />
              ลบรายการ
            </IonButton>

          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default EditExpense;
