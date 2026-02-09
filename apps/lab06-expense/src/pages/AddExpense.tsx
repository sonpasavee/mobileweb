import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList
} from '@ionic/react';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useHistory } from 'react-router-dom';

const AddExpense: React.FC = () => {
  const history = useHistory();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  const saveExpense = async () => {
    if (!title || !amount || amount <= 0) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    await addDoc(collection(db, 'expenses'), {
      title,
      amount: Number(amount),
      type,
      category,
      note,
      createdAt: new Date()
    });

    history.push('/list');
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
            เพิ่มรายการรายรับ–รายจ่าย
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* Content */}
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
            <IonList lines="none">

              <IonItem
                style={{
                  '--background': '#f9fafb',
                  borderRadius: '12px',
                  marginBottom: '12px'
                }}
              >
                <IonInput
                  label="ชื่อรายการ"
                  labelPlacement="stacked"
                  placeholder="ค่าอาหาร / เงินเดือน"
                  value={title}
                  onIonChange={e => setTitle(e.detail.value!)}
                />
              </IonItem>

              <IonItem
                style={{
                  '--background': '#f9fafb',
                  borderRadius: '12px',
                  marginBottom: '12px'
                }}
              >
                <IonInput
                  label="จำนวนเงิน"
                  labelPlacement="stacked"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onIonChange={e =>
                    setAmount(Number(e.detail.value))
                  }
                />
              </IonItem>

              <IonItem
                style={{
                  '--background': '#f9fafb',
                  borderRadius: '12px',
                  marginBottom: '12px'
                }}
              >
                <IonLabel position="stacked">ประเภท</IonLabel>
                <IonSelect
                  value={type}
                  placeholder="เลือกประเภท"
                  onIonChange={e => setType(e.detail.value)}
                >
                  <IonSelectOption value="income">
                    รายรับ
                  </IonSelectOption>
                  <IonSelectOption value="expense">
                    รายจ่าย
                  </IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem
                style={{
                  '--background': '#f9fafb',
                  borderRadius: '12px',
                  marginBottom: '12px'
                }}
              >
                <IonInput
                  label="หมวดหมู่"
                  labelPlacement="stacked"
                  placeholder="อาหาร / เดินทาง / ช้อปปิ้ง"
                  value={category}
                  onIonChange={e => setCategory(e.detail.value!)}
                />
              </IonItem>

              <IonItem
                style={{
                  '--background': '#f9fafb',
                  borderRadius: '12px'
                }}
              >
                <IonTextarea
                  label="หมายเหตุ"
                  labelPlacement="stacked"
                  autoGrow
                  placeholder="รายละเอียดเพิ่มเติม"
                  value={note}
                  onIonChange={e => setNote(e.detail.value!)}
                />
              </IonItem>

            </IonList>

            <IonButton
              expand="block"
              size="large"
              className="ion-margin-top"
              style={{
                '--background':
                  type === 'income'
                    ? 'linear-gradient(135deg, #43e97b, #38f9d7)'
                    : 'linear-gradient(135deg, #fa709a, #fee140)',
                '--border-radius': '14px',
                fontWeight: 600
              }}
              onClick={saveExpense}
            >
              บันทึกข้อมูล
            </IonButton>

          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AddExpense;
