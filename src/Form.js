import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import JsPDF from 'jspdf';
import 'jspdf-autotable';

const DynamicForm = () => {
    const { control, handleSubmit, register, watch } = useForm();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'fields',
    });
    const [average, setAverage] = useState(0);
    const [earnedCredits, setEarnedCredits] = useState(0);
    const [lostCredits, setLostCredits] = useState(0);
    const [KKI, setKKI] = useState(0);
    const [isChecked, setIsChecked] = useState(false);

    const downloadPDF = (data) => {
        const pdf = new JsPDF();
        const headers = ['Name of Subject', 'Credit', 'Grade'];
        const rows = data.fields.map((field) => [field.name, field.weight, field.value]);

        pdf.autoTable({
            head: [headers],
            body: rows
        });

        pdf.text(`Average: ${average}`, 14, pdf.autoTable.previous.finalY + 10);
        pdf.text(`Earned Credits: ${earnedCredits}`, 14, pdf.autoTable.previous.finalY + 20);
        pdf.text(`Lost Credits: ${lostCredits}`, 14, pdf.autoTable.previous.finalY + 30);
        pdf.text(`KKI: ${KKI}`, 14, pdf.autoTable.previous.finalY + 40);
        pdf.save('average-calculation.pdf');
    };

    function SetDigit(number) {
        if (Number.isInteger(number)) {
            return number
        } else {
            return number.toFixed(3);
        }
    }

    const onSubmit = (data) => {
        let sumWeightTimesValue = 0;
        let sumWeight = 0;
        let sumEarned = 0;
        let sumLost = 0;
        let sumKKI = 0;
        data.fields.forEach(element => {
            if (!isChecked) {
                sumWeightTimesValue += parseInt(element.weight)*parseInt(element.value);
            }
            else {
                if (parseInt(element.value) > 1) {
                    sumWeightTimesValue += parseInt(element.weight)*parseInt(element.value);
                }
            }
            sumWeight += parseInt(element.weight);
            if (parseInt(element.value) <= 1) {
                sumLost += parseInt(element.weight);
            } else {
                sumEarned += parseInt(element.weight);
                sumKKI += parseInt(element.value) * parseInt(element.weight);
            }
        });

        let allCredits = sumEarned + sumLost; 
        let kkindex = (sumKKI/30) * (sumEarned/allCredits); 
        let avg = (sumWeightTimesValue/sumWeight);

        if (isNaN(sumLost)) {
          sumLost = 0;
        }
        setKKI(kkindex);
        setEarnedCredits(sumEarned);
        setLostCredits(sumLost);
        setAverage(SetDigit(avg));
    }

    if (fields.length === 0) {
        append({ name: '', weight: '', value: '' });

    }

    const handleRadioChange = (event) => {
        setIsChecked(event.target.value === 'Yes');
    };


    return (
    <>
    <div className='h1'>
        <h1>Weighted average<br/>calculator</h1>
    </div>
    
        <form onSubmit={handleSubmit(onSubmit)}>
            
            {fields.map((field, index) => (
                <div className='form-holder' key={field.id}>

                    <div className="form-items">
                        <label htmlFor={`fields[${index}].name`}>Name</label>
                        <input
                            {...register(`fields[${index}].name`,
                            { required: false })}
                            type='text' className='nameText'
                        />
                    </div>

                    <div className="form-items">
                        <label htmlFor={`fields[${index}].weight`}>Weight</label>
                        <input
                            {...register(`fields[${index}].weight`,
                            { required: true })}
                            type='text' className='numberText'
                        />
                    </div>

                    <div className="form-items">
                        <label htmlFor={`fields[${index}].value`}>Value</label>
                        <input
                            {...register(`fields[${index}].value`,
                            { required: true })}
                            type='text' className='numberText'  
                        /> 
                    </div>
                    <input id="minus" className='operatorButton' type="button" value="-" onClick={() => remove(index)}/>
            </div>
        ))}
            <div className="form-holder">
                <p>Counts in average if failure?</p>
                <div className='counts-holder'>
                    <label htmlFor="countsIfyes">Yes </label>
                    <input
                        type="radio"
                        name="radioB"
                        id="countsIfyes"
                        value="Yes"
                        checked={isChecked}
                        onChange={handleRadioChange}
                    />
                </div>
                <div className='counts-holder'>
                    <label htmlFor="countsIfno">No </label>
                    <input
                        type="radio"
                        name="radioB"
                        id="countsIfno"
                        value="No"
                        checked={!isChecked}
                        onChange={handleRadioChange}
                    />
                </div>
            </div>
            <div className='form-holder-bottom'>
                <div className="form-items">
                    <input type="submit" value="Calculate"/>
                </div>
                <div className="form-items">
                    <input className='downloadButton' type="button" value="Save PDF" onClick={handleSubmit(downloadPDF)}/>
                </div>
                <div className="form-items">
                    <input className='operatorButton' type="button" value="+" onClick={() => {
                        append({ name: '', weight: '', value:'' });
                    }}
                />
                </div>

            </div>
        </form>
        <div class="result-container">
            <div className="form-items-row">
                <div className="form-items-label">
                    <label htmlFor="average">Average: </label>
                    <input readOnly className='numberText' type="text" value={average}/>
                </div>
            </div>
            <div className="form-items-row">
                <div className="form-items-label">
                    <label htmlFor="earnedCredits">Earned credits: </label>
                    <input readOnly className='numberText' type="text" value={earnedCredits}/>
                </div>
            </div>
            <div className="form-items-row">
                <div className="form-items-label">
                    <label htmlFor="earnedCredits">Lost credits: </label>
                    <input readOnly className='numberText' type="text" value={lostCredits}/>
                </div>
            </div>
            <div className="form-items-row">
                <div className="form-items-label">
                    <label htmlFor="earnedCredits">KKI: </label>
                    <input readOnly className='numberText' type="text" value={SetDigit(KKI)}/>
                </div>
            </div>
        </div>
    </>
  );
};

export default DynamicForm;
